"""
네이버 금융 종목별 뉴스 제목 크롤러.
HDFS 경로: /data/stock/{symbol}/year={YYYY}/month={MM}/day={DD}/news.parquet

공식 API가 아니므로 보조 기능 — robots.txt 준수 및 rate limit 적용.
"""

import os
import time
import logging
import argparse
from datetime import date, timedelta
from urllib.parse import quote

import requests
import pandas as pd
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

OUTPUT_ROOT = os.environ.get("OUTPUT_ROOT", "/tmp/stock-data")
NAVER_NEWS_URL = "https://finance.naver.com/item/news_news.naver"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Referer": "https://finance.naver.com",
}

# 긍정/부정 키워드 사전
POSITIVE_KEYWORDS = [
    "수주", "공급계약", "흑자전환", "실적개선", "증설", "신규투자",
    "승인", "자사주", "배당", "호실적", "신제품", "수출", "협약",
]
NEGATIVE_KEYWORDS = [
    "적자", "소송", "상장폐지", "감자", "횡령", "배임",
    "실적악화", "불성실공시", "과태료", "조사", "리콜",
]


def _parquet_path(root: str, symbol: str, target_date: date, filename: str) -> str:
    return os.path.join(
        root, "stock", symbol,
        f"year={target_date.year}",
        f"month={target_date.month:02d}",
        f"day={target_date.day:02d}",
        filename,
    )


def _score_title(title: str) -> int:
    """뉴스 제목 키워드 점수 계산."""
    score = 0
    for kw in POSITIVE_KEYWORDS:
        if kw in title:
            score += 1
    for kw in NEGATIVE_KEYWORDS:
        if kw in title:
            score -= 2
    return score


def crawl_news(symbol: str, target_date: date, pages: int = 3) -> pd.DataFrame:
    """네이버 금융 종목 뉴스 크롤링."""
    date_str = target_date.strftime("%Y.%m.%d")
    records = []

    for page in range(1, pages + 1):
        try:
            resp = requests.get(
                NAVER_NEWS_URL,
                params={"code": symbol, "page": page},
                headers=HEADERS,
                timeout=10,
            )
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            rows = soup.select("table.type5 tr")
            for row in rows:
                title_tag = row.select_one("td.title a")
                date_tag = row.select_one("td.date")
                if not title_tag or not date_tag:
                    continue

                news_date = date_tag.text.strip()[:10]  # YYYY.MM.DD
                if news_date < target_date.strftime("%Y.%m.%d"):
                    # 날짜가 지났으면 더 이전 페이지 볼 필요 없음
                    break

                title = title_tag.text.strip()
                records.append({
                    "symbol": symbol,
                    "date": news_date,
                    "title": title,
                    "keyword_score": _score_title(title),
                })

            time.sleep(0.5)
        except Exception as e:
            log.debug("뉴스 크롤링 실패 (%s, page %d): %s", symbol, page, e)
            break

    return pd.DataFrame(records) if records else pd.DataFrame(
        columns=["symbol", "date", "title", "keyword_score"]
    )


def save(df: pd.DataFrame, path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    df.to_parquet(path, index=False)
    log.info("저장: %s (%d rows)", path, len(df))


def run(symbols: list[str], target_date: date, output_root: str) -> None:
    log.info("뉴스 수집 시작 — %d종목, %s", len(symbols), target_date)
    success = 0

    for sym in symbols:
        df = crawl_news(sym, target_date)
        if not df.empty:
            path = _parquet_path(output_root, sym, target_date, "news.parquet")
            save(df, path)
            success += 1
        time.sleep(1.0)  # 서버 부하 방지

    log.info("완료 — 뉴스 수집: %d종목", success)


def main() -> None:
    parser = argparse.ArgumentParser(description="네이버 금융 뉴스 크롤러")
    parser.add_argument("--date", default=str(date.today()),
                        help="수집 날짜 YYYY-MM-DD")
    parser.add_argument("--output", default=OUTPUT_ROOT)
    parser.add_argument("--symbols", nargs="+", default=[],
                        help="종목 코드 목록 (미지정 시 pykrx에서 전체 로드)")
    args = parser.parse_args()

    if args.symbols:
        symbols = args.symbols
    else:
        # pykrx 없이도 실행 가능하도록 try
        try:
            from pykrx import stock
            symbols = list(stock.get_market_ticker_list(market="KOSPI")) + \
                      list(stock.get_market_ticker_list(market="KOSDAQ"))
        except ImportError:
            log.error("--symbols 미지정 시 pykrx가 필요합니다.")
            return

    run(symbols, date.fromisoformat(args.date), args.output)


if __name__ == "__main__":
    main()
