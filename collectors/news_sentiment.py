"""
Ollama 기반 뉴스 제목 감성 분석기 (팀 공통 스펙 v2).

news 파티션(part-0.parquet, dart-disclosures.parquet)을 읽어
sentiment_keywords, sentiment_score 컬럼을 추가하고 덮어쓴다.

사전 준비:
  ollama pull llama3.2          # 기본 모델 (~2 GB)
  # 한국어 성능 개선 시:
  # ollama pull qwen2.5:7b     (~4.7 GB, 한국어 우수)

환경변수:
  HDFS_BASE     저장 경로 루트 (기본: /tmp/stock-data)
  OLLAMA_URL    Ollama API 주소 (기본: http://localhost:11434)
  OLLAMA_MODEL  사용 모델명    (기본: llama3.2)
"""

import os
import json
import logging
import argparse
from datetime import date

import pandas as pd
import requests

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

HDFS_BASE    = os.environ.get("HDFS_BASE",    "/tmp/stock-data")
OLLAMA_URL   = os.environ.get("OLLAMA_URL",   "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2")
BATCH_SIZE   = 10  # 한 번에 LLM에 보낼 뉴스 수

# ── 프롬프트 ─────────────────────────────────────────────────
_PROMPT = """\
다음 뉴스 제목들을 주식 투자 관점에서 분석하세요.

판단 기준 (키워드와 문맥을 함께 고려):
- 수급·매매: 수주, 계약, 매수, 매도
- 실적·재무: 흑자, 적자, 매출, 영업이익
- 리스크: 소송, 제재, 리콜, 부도
- 모멘텀: 신고가, 급등, 상승, 하락

규칙:
- sentiment_score: -1.0(매우 부정) ~ 1.0(매우 긍정), 관련 키워드 없으면 0.0
- keywords: 해당 제목에서 감지된 키워드 목록 (없으면 빈 배열)
- id 번호는 입력 순서 그대로 유지

뉴스 목록:
{titles}

JSON 배열만 반환하고 다른 텍스트는 절대 출력하지 마세요:
[{{"id":0,"keywords":[],"sentiment_score":0.0}}, ...]"""


# ── Ollama 호출 ───────────────────────────────────────────────
def _call_ollama(prompt: str, timeout: int = 60) -> str:
    resp = requests.post(
        f"{OLLAMA_URL}/api/generate",
        json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
        timeout=timeout,
    )
    resp.raise_for_status()
    return resp.json().get("response", "").strip()


def _parse_json_array(raw: str) -> list[dict]:
    """응답 문자열에서 JSON 배열만 추출."""
    start = raw.find("[")
    end   = raw.rfind("]") + 1
    if start == -1 or end == 0:
        raise ValueError("JSON 배열을 찾을 수 없음")
    return json.loads(raw[start:end])


def _batch_analyze(titles: list[str]) -> list[dict]:
    """titles 배치 → [{id, keywords, sentiment_score}, ...] 반환."""
    numbered = "\n".join(f"{i}. {t}" for i, t in enumerate(titles))
    prompt   = _PROMPT.format(titles=numbered)
    try:
        raw     = _call_ollama(prompt)
        results = _parse_json_array(raw)
        results.sort(key=lambda x: x.get("id", 0))
        for r in results:
            r["sentiment_score"] = max(-1.0, min(1.0, float(r.get("sentiment_score", 0.0))))
        return results
    except Exception as e:
        log.warning("배치 분석 실패 (%d건), 개별 처리로 전환: %s", len(titles), e)
        return []


def _single_analyze(title: str) -> tuple[list[str], float]:
    """단건 fallback."""
    prompt = _PROMPT.format(titles=f"0. {title}")
    try:
        raw  = _call_ollama(prompt, timeout=30)
        data = _parse_json_array(raw)[0]
        score = max(-1.0, min(1.0, float(data.get("sentiment_score", 0.0))))
        return data.get("keywords", []), score
    except Exception:
        return [], 0.0


# ── 분석 실행 ─────────────────────────────────────────────────
def _analyze(df: pd.DataFrame) -> pd.DataFrame:
    """title 컬럼 분석 → sentiment_keywords, sentiment_score 컬럼 추가."""
    titles  = df["title"].astype(str).tolist()
    kws_all = [""] * len(titles)
    scr_all = [0.0] * len(titles)

    for batch_start in range(0, len(titles), BATCH_SIZE):
        batch   = titles[batch_start: batch_start + BATCH_SIZE]
        results = _batch_analyze(batch)

        if len(results) == len(batch):
            for i, r in enumerate(results):
                idx = batch_start + i
                kws_all[idx] = ", ".join(r.get("keywords", []))
                scr_all[idx] = r["sentiment_score"]
        else:
            # 배치 실패 → 개별 처리
            for i, title in enumerate(batch):
                kws, score = _single_analyze(title)
                idx = batch_start + i
                kws_all[idx] = ", ".join(kws)
                scr_all[idx] = score

        done = min(batch_start + BATCH_SIZE, len(titles))
        log.info("감성 분석 진행: %d / %d", done, len(titles))

    df = df.copy()
    df["sentiment_keywords"] = kws_all
    df["sentiment_score"]    = scr_all
    return df


# ── 경로 헬퍼 ─────────────────────────────────────────────────
def _hdfs_dir(base: str, d: date) -> str:
    return os.path.join(
        base, "data", "stock", "news",
        f"year={d.year}", f"month={d.month:02d}", f"day={d.day:02d}",
    )


# ── 메인 ──────────────────────────────────────────────────────
def run(target_date: date, hdfs_base: str) -> None:
    dir_path = _hdfs_dir(hdfs_base, target_date)
    targets  = ["part-0.parquet", "dart-disclosures.parquet"]

    for fname in targets:
        path = os.path.join(dir_path, fname)
        if not os.path.exists(path):
            log.debug("파일 없음 (건너뜀): %s", path)
            continue

        log.info("[%s] 감성 분석 시작 (모델: %s)...", fname, OLLAMA_MODEL)
        df  = pd.read_parquet(path)
        df  = _analyze(df)
        df.to_parquet(path, index=False)
        log.info(
            "[%s] 완료 — %d건, 평균 점수: %.3f (긍정: %d건 / 부정: %d건)",
            fname, len(df),
            df["sentiment_score"].mean(),
            (df["sentiment_score"] > 0).sum(),
            (df["sentiment_score"] < 0).sum(),
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="Ollama 뉴스 감성 분석기")
    parser.add_argument("--date",  default=str(date.today()), help="분석 날짜 YYYY-MM-DD")
    parser.add_argument("--base",  default=HDFS_BASE,         help="HDFS 기본 경로")
    parser.add_argument("--model", default=OLLAMA_MODEL,      help="Ollama 모델명")
    args = parser.parse_args()

    global OLLAMA_MODEL
    OLLAMA_MODEL = args.model

    run(date.fromisoformat(args.date), args.base)


if __name__ == "__main__":
    main()
