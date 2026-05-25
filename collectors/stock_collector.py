"""
pykrx 기반 국내 주식 OHLCV 및 투자자별 수급 데이터 수집기.
HDFS 경로: /data/stock/{symbol}/year={YYYY}/month={MM}/day={DD}/
"""

import os
import argparse
import logging
from datetime import date, timedelta

import pandas as pd
from pykrx import stock

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# 저장 루트 — 환경변수로 HDFS 경로로 교체 가능
OUTPUT_ROOT = os.environ.get("OUTPUT_ROOT", "/tmp/stock-data")


def _parquet_path(root: str, symbol: str, target_date: date, filename: str) -> str:
    return os.path.join(
        root,
        "stock",
        symbol,
        f"year={target_date.year}",
        f"month={target_date.month:02d}",
        f"day={target_date.day:02d}",
        filename,
    )


def get_symbols(target_date: date, market: str = "ALL") -> list[str]:
    """KOSPI + KOSDAQ 전체 종목 코드 반환."""
    date_str = target_date.strftime("%Y%m%d")
    kospi = list(stock.get_market_ticker_list(date_str, market="KOSPI"))
    kosdaq = list(stock.get_market_ticker_list(date_str, market="KOSDAQ"))
    if market == "KOSPI":
        return kospi
    if market == "KOSDAQ":
        return kosdaq
    return kospi + kosdaq


def collect_ohlcv(symbols: list[str], target_date: date) -> dict[str, pd.DataFrame]:
    """종목별 OHLCV + 등락률 수집."""
    date_str = target_date.strftime("%Y%m%d")
    results: dict[str, pd.DataFrame] = {}

    for market in ("KOSPI", "KOSDAQ"):
        try:
            df = stock.get_market_ohlcv(date_str, market=market)
            if df.empty:
                continue

            df.index.name = "symbol"
            df = df.reset_index()

            # pykrx 반환 컬럼: 시가 고가 저가 종가 거래량 거래대금 등락률 시가총액
            col_map = {
                "티커": "symbol",
                "시가": "open", "고가": "high", "저가": "low", "종가": "close",
                "거래량": "volume", "거래대금": "trading_value",
                "등락률": "change_rate", "시가총액": "market_cap",
            }
            df = df.rename(columns=col_map)

            # 거래 없는 행(종가=0) 제외 — 휴장일 또는 상장폐지 종목
            df = df[df["close"] > 0]

            symbol_set = set(symbols)
            for _, row in df.iterrows():
                sym = row["symbol"]
                if sym in symbol_set:
                    results[sym] = row.to_frame().T.reset_index(drop=True)
        except Exception as e:
            log.warning("OHLCV 조회 실패 (%s): %s", market, e)

    return results


def collect_investor(symbols: list[str], target_date: date) -> dict[str, pd.DataFrame]:
    """종목별 외국인/기관/개인 순매수 수집."""
    date_str = target_date.strftime("%Y%m%d")
    results: dict[str, pd.DataFrame] = {}

    for market in ("KOSPI", "KOSDAQ"):
        try:
            df = stock.get_market_trading_volume_by_investor(date_str, date_str, market)
            if df.empty:
                continue
            df = df.reset_index()
            # 종목별 수급이 아니라 전체 시장 투자자별이므로 종목별 조회로 보완
        except Exception as e:
            log.warning("시장 수급 조회 실패 (%s): %s", market, e)

    # 종목별 수급 (상위 100개만 예시 — 전체 시 시간 소요)
    sampled = symbols[:100] if len(symbols) > 100 else symbols
    for sym in sampled:
        try:
            df = stock.get_market_trading_value_by_investor(date_str, date_str, sym)
            if df.empty:
                continue
            df = df.reset_index()
            df.insert(0, "symbol", sym)
            results[sym] = df
        except Exception as e:
            log.debug("수급 조회 실패 (%s): %s", sym, e)

    return results


def save(df: pd.DataFrame, path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    df.to_parquet(path, index=False)
    log.info("저장: %s (%d rows)", path, len(df))


def run(target_date: date, output_root: str) -> None:
    log.info("수집 날짜: %s", target_date)
    symbols = get_symbols(target_date)
    if not symbols:
        log.warning("종목 목록이 비어 있습니다 — KRX 접속 실패 또는 휴장일일 수 있습니다.")
        return
    log.info("총 종목 수: %d", len(symbols))

    # OHLCV
    ohlcv_map = collect_ohlcv(symbols, target_date)
    for sym, df in ohlcv_map.items():
        path = _parquet_path(output_root, sym, target_date, "ohlcv.parquet")
        save(df, path)

    # 수급
    investor_map = collect_investor(symbols, target_date)
    for sym, df in investor_map.items():
        path = _parquet_path(output_root, sym, target_date, "investor.parquet")
        save(df, path)

    log.info("완료 — OHLCV: %d종목, 수급: %d종목", len(ohlcv_map), len(investor_map))


def main() -> None:
    parser = argparse.ArgumentParser(description="pykrx 주식 데이터 수집기")
    parser.add_argument("--date", default=str(date.today() - timedelta(days=1)),
                        help="수집 날짜 YYYY-MM-DD (기본: 전일)")
    parser.add_argument("--output", default=OUTPUT_ROOT, help="저장 루트 경로")
    args = parser.parse_args()

    target = date.fromisoformat(args.date)
    run(target, args.output)


if __name__ == "__main__":
    main()
