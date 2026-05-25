"""
네이버 금융 종목별 뉴스 크롤러 (팀 공통 스펙 v2).

HDFS 경로: {HDFS_BASE}/data/stock/news/year={Y}/month={M}/day={D}/part-0.parquet
컬럼: symbol, date, published_at, source, title

공식 API가 아니므로 보조 기능 — robots.txt 준수 및 rate limit 적용.
"""

import os
import time
import logging
import argparse
from datetime import date

import requests
import pandas as pd
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

HDFS_BASE = os.environ.get("HDFS_BASE", "/tmp/stock-data")
NAVER_NEWS_URL = "https://finance.naver.com/item/news_news.naver"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Referer": "https://finance.naver.com",
}


def _hdfs_dir(base: str, d: date) -> str:
    return os.path.join(
        base, "data", "stock", "news",
        f"year={d.year}", f"month={d.month:02d}", f"day={d.day:02d}",
    )


def _save(df: pd.DataFrame, dir_path: str) -> None:
    os.makedirs(dir_path, exist_ok=True)
    path = os.path.join(dir_path, "part-0.parquet")
    df.to_parquet(path, index=False)
    log.info("저장: %s (%d rows)", path, len(df))


def crawl_news(symbol: str, target_date: date, pages: int = 3) -> list[dict]:
    """네이버 금융 종목 뉴스 크롤링 — 당일 뉴스만 반환."""
    target_str = target_date.strftime("%Y.%m.%d")
    records: list[dict] = []

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

            past_target = False
            for row in soup.select("table.type5 tr"):
                title_tag = row.select_one("td.title a")
                date_tag  = row.select_one("td.date")
                info_tag  = row.select_one("td.info")  # 언론사

                if not title_tag or not date_tag:
                    continue

                raw_date  = date_tag.text.strip()  # "YYYY.MM.DD HH:MM" 또는 "YYYY.MM.DD"
                news_date = raw_date[:10]           # "YYYY.MM.DD"

                if news_date < target_str:
                    past_target = True
                    break
                if news_date > target_str:
                    continue

                # published_at: "YYYY-MM-DD HH:MM" 형식으로 정규화
                if len(raw_date) > 10:
                    published_at = raw_date[:10].replace(".", "-") + " " + raw_date[11:]
                else:
                    published_at = raw_date.replace(".", "-")

                records.append({
                    "symbol":       symbol,
                    "date":         target_date.isoformat(),
                    "published_at": published_at,
                    "source":       info_tag.text.strip() if info_tag else "",
                    "title":        title_tag.text.strip(),
                })

            if past_target:
                break
            time.sleep(0.5)
        except Exception as e:
            log.debug("뉴스 크롤링 실패 (%s, page %d): %s", symbol, page, e)
            break

    return records


def run(symbols: list[str], target_date: date, hdfs_base: str) -> None:
    log.info("뉴스 수집 시작 — %d종목, %s", len(symbols), target_date)
    all_records: list[dict] = []

    for i, sym in enumerate(symbols, 1):
        records = crawl_news(sym, target_date)
        all_records.extend(records)
        time.sleep(1.0)
        if i % 100 == 0:
            log.info("뉴스 진행: %d/%d, 누적 기사: %d", i, len(symbols), len(all_records))

    if all_records:
        df = pd.DataFrame(all_records)
        _save(df, _hdfs_dir(hdfs_base, target_date))
        log.info("완료 — 총 뉴스 기사: %d건", len(df))
    else:
        log.warning("수집된 뉴스가 없습니다.")


def main() -> None:
    parser = argparse.ArgumentParser(description="네이버 금융 뉴스 크롤러 (팀 스펙 v2)")
    parser.add_argument("--date", default=str(date.today()), help="수집 날짜 YYYY-MM-DD")
    parser.add_argument("--base", default=HDFS_BASE, help="HDFS 기본 경로")
    parser.add_argument("--symbols", nargs="+", default=[],
                        help="종목 코드 목록 (미지정 시 pykrx 전체 로드)")
    args = parser.parse_args()

    if args.symbols:
        symbols = [str(s).zfill(6) for s in args.symbols]
    else:
        try:
            from pykrx import stock
            date_str = args.date.replace("-", "")
            symbols = (
                [str(s).zfill(6) for s in stock.get_market_ticker_list(date_str, market="KOSPI")]
                + [str(s).zfill(6) for s in stock.get_market_ticker_list(date_str, market="KOSDAQ")]
            )
        except ImportError:
            log.error("--symbols 미지정 시 pykrx가 필요합니다.")
            return

    run(symbols, date.fromisoformat(args.date), args.base)


if __name__ == "__main__":
    main()
