"""
DART Open API 기반 재무제표 및 공시 데이터 수집기.
HDFS 경로: /data/stock/{symbol}/year={YYYY}/month={MM}/day={DD}/financial.parquet
공시: /data/stock/{symbol}/year={YYYY}/month={MM}/day={DD}/news.parquet (공시 제목)

환경변수 DART_API_KEY 필요.
"""

import os
import time
import logging
import argparse
from datetime import date, timedelta

import requests
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

DART_API_KEY = os.environ.get("DART_API_KEY", "")
OUTPUT_ROOT = os.environ.get("OUTPUT_ROOT", "/tmp/stock-data")
DART_BASE = "https://opendart.fss.or.kr/api"

# 재무항목 코드 매핑 (단순화)
FIN_ACCOUNTS = {
    "매출액": "ifrs-full_Revenue",
    "영업이익": "dart_OperatingIncomeLoss",
    "당기순이익": "ifrs-full_ProfitLoss",
    "자산총계": "ifrs-full_Assets",
    "부채총계": "ifrs-full_Liabilities",
    "자본총계": "ifrs-full_Equity",
}


def _parquet_path(root: str, symbol: str, target_date: date, filename: str) -> str:
    return os.path.join(
        root, "stock", symbol,
        f"year={target_date.year}",
        f"month={target_date.month:02d}",
        f"day={target_date.day:02d}",
        filename,
    )


def _get(endpoint: str, params: dict) -> dict:
    params["crtfc_key"] = DART_API_KEY
    resp = requests.get(f"{DART_BASE}/{endpoint}.json", params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()


def get_corp_codes() -> pd.DataFrame:
    """전체 기업 고유번호(corp_code) 목록 다운로드."""
    import zipfile
    import io

    url = f"{DART_BASE}/corpCode.xml"
    resp = requests.get(url, params={"crtfc_key": DART_API_KEY}, timeout=60)
    resp.raise_for_status()

    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        with zf.open("CORPCODE.xml") as f:
            df = pd.read_xml(f)

    # stock_code가 있는 상장사만 필터
    df = df[df["stock_code"].notna() & (df["stock_code"] != " ")]
    df["stock_code"] = df["stock_code"].str.strip()
    log.info("상장 기업 수: %d", len(df))
    return df


def collect_financial(corp_code: str, symbol: str, year: int) -> pd.DataFrame | None:
    """단일 기업 연간 재무제표 수집."""
    try:
        data = _get("fnlttSinglAcntAll", {
            "corp_code": corp_code,
            "bsns_year": str(year),
            "reprt_code": "11011",  # 사업보고서
            "fs_div": "CFS",        # 연결재무제표
        })
        if data.get("status") != "000":
            return None

        rows = data.get("list", [])
        if not rows:
            return None

        df = pd.DataFrame(rows)
        df.insert(0, "symbol", symbol)
        # 주요 항목만 추출
        df = df[df["account_id"].isin(FIN_ACCOUNTS.values())]
        df = df[["symbol", "account_nm", "thstrm_amount", "frmtrm_amount", "bfefrmtrm_amount"]]
        df.columns = ["symbol", "account", "current_year", "prev_year", "prev2_year"]
        return df
    except Exception as e:
        log.debug("재무 수집 실패 (%s): %s", symbol, e)
        return None


def collect_disclosures(corp_code: str, symbol: str, target_date: date) -> pd.DataFrame | None:
    """단일 기업 당일 공시 제목 수집."""
    try:
        date_str = target_date.strftime("%Y%m%d")
        data = _get("list", {
            "corp_code": corp_code,
            "bgn_de": date_str,
            "end_de": date_str,
            "page_count": 10,
        })
        if data.get("status") != "000":
            return None

        rows = data.get("list", [])
        if not rows:
            return None

        df = pd.DataFrame(rows)[["rcept_dt", "report_nm"]]
        df.insert(0, "symbol", symbol)
        df.columns = ["symbol", "date", "title"]
        return df
    except Exception as e:
        log.debug("공시 수집 실패 (%s): %s", symbol, e)
        return None


def save(df: pd.DataFrame, path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    df.to_parquet(path, index=False)
    log.info("저장: %s (%d rows)", path, len(df))


def run(target_date: date, output_root: str) -> None:
    if not DART_API_KEY:
        raise EnvironmentError("환경변수 DART_API_KEY가 필요합니다.")

    corp_df = get_corp_codes()
    year = target_date.year if target_date.month > 3 else target_date.year - 1

    fin_count, disc_count = 0, 0
    for _, row in corp_df.iterrows():
        symbol = row["stock_code"]
        corp_code = str(row["corp_code"]).zfill(8)

        # 재무제표 (연 1회 갱신이므로 파일 없을 때만 수집)
        fin_path = _parquet_path(output_root, symbol, target_date, "financial.parquet")
        if not os.path.exists(fin_path):
            df_fin = collect_financial(corp_code, symbol, year)
            if df_fin is not None:
                save(df_fin, fin_path)
                fin_count += 1
            time.sleep(0.3)  # DART API rate limit

        # 공시 (매일)
        disc_path = _parquet_path(output_root, symbol, target_date, "disclosure.parquet")
        df_disc = collect_disclosures(corp_code, symbol, target_date)
        if df_disc is not None:
            save(df_disc, disc_path)
            disc_count += 1
        time.sleep(0.2)

    log.info("완료 — 재무: %d, 공시: %d", fin_count, disc_count)


def main() -> None:
    parser = argparse.ArgumentParser(description="DART 재무/공시 수집기")
    parser.add_argument("--date", default=str(date.today()),
                        help="수집 날짜 YYYY-MM-DD (기본: 오늘)")
    parser.add_argument("--output", default=OUTPUT_ROOT)
    args = parser.parse_args()
    run(date.fromisoformat(args.date), args.output)


if __name__ == "__main__":
    main()
