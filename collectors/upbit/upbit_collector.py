"""
Upbit API 기반 암호화폐 OHLCV 수집기 (확장 기능).
HDFS 경로: /data/crypto/{symbol}/year={YYYY}/month={MM}/day={DD}/ohlcv.parquet

Upbit Public API — 인증 불필요.
"""

import os
import time
import logging
import argparse
from datetime import date, timedelta, datetime, timezone

import requests
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

OUTPUT_ROOT = os.environ.get("OUTPUT_ROOT", "/tmp/stock-data")
UPBIT_BASE = "https://api.upbit.com/v1"

# 분석 대상 주요 암호화폐
DEFAULT_MARKETS = [
    "KRW-BTC", "KRW-ETH", "KRW-XRP", "KRW-SOL", "KRW-ADA",
    "KRW-DOGE", "KRW-AVAX", "KRW-DOT", "KRW-MATIC", "KRW-LINK",
]


def _parquet_path(root: str, symbol: str, target_date: date, filename: str) -> str:
    return os.path.join(
        root, "crypto", symbol,
        f"year={target_date.year}",
        f"month={target_date.month:02d}",
        f"day={target_date.day:02d}",
        filename,
    )


def get_all_krw_markets() -> list[str]:
    """Upbit KRW 마켓 전체 목록 조회."""
    resp = requests.get(f"{UPBIT_BASE}/market/all", params={"isDetails": "false"}, timeout=10)
    resp.raise_for_status()
    return [m["market"] for m in resp.json() if m["market"].startswith("KRW-")]


def collect_daily_ohlcv(market: str, target_date: date, count: int = 1) -> pd.DataFrame | None:
    """특정 마켓의 일봉 OHLCV 수집."""
    # to: 다음날 00:00 KST → UTC 변환
    next_day = target_date + timedelta(days=1)
    to_dt = datetime(next_day.year, next_day.month, next_day.day, 0, 0, 0,
                     tzinfo=timezone.utc)
    to_str = to_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

    try:
        resp = requests.get(
            f"{UPBIT_BASE}/candles/days",
            params={"market": market, "to": to_str, "count": count},
            headers={"Accept": "application/json"},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        if not data:
            return None

        df = pd.DataFrame(data)
        df = df.rename(columns={
            "market": "symbol",
            "candle_date_time_kst": "datetime_kst",
            "opening_price": "open",
            "high_price": "high",
            "low_price": "low",
            "trade_price": "close",
            "candle_acc_trade_volume": "volume",
            "candle_acc_trade_price": "trading_value",
        })
        cols = ["symbol", "datetime_kst", "open", "high", "low", "close",
                "volume", "trading_value"]
        df = df[[c for c in cols if c in df.columns]]

        # 전일 대비 변동률 (단일 행이므로 NaN)
        df["change_rate"] = None
        return df
    except Exception as e:
        log.debug("Upbit OHLCV 실패 (%s): %s", market, e)
        return None


def collect_ticker(markets: list[str]) -> pd.DataFrame:
    """현재 시세(ticker) 일괄 조회."""
    try:
        resp = requests.get(
            f"{UPBIT_BASE}/ticker",
            params={"markets": ",".join(markets)},
            headers={"Accept": "application/json"},
            timeout=10,
        )
        resp.raise_for_status()
        df = pd.DataFrame(resp.json())
        df = df.rename(columns={"market": "symbol"})
        return df[["symbol", "trade_price", "change_rate", "acc_trade_volume_24h",
                   "acc_trade_price_24h", "high_price", "low_price", "opening_price"]]
    except Exception as e:
        log.warning("Ticker 조회 실패: %s", e)
        return pd.DataFrame()


def save(df: pd.DataFrame, path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    df.to_parquet(path, index=False)
    log.info("저장: %s (%d rows)", path, len(df))


def run(markets: list[str], target_date: date, output_root: str) -> None:
    log.info("암호화폐 수집 시작 — %d마켓, %s", len(markets), target_date)
    success = 0

    for market in markets:
        symbol = market.replace("KRW-", "")  # BTC, ETH ...
        df = collect_daily_ohlcv(market, target_date)
        if df is not None:
            path = _parquet_path(output_root, symbol, target_date, "ohlcv.parquet")
            save(df, path)
            success += 1
        time.sleep(0.1)  # Upbit rate limit: 초당 10회

    log.info("완료 — 수집: %d마켓", success)


def main() -> None:
    parser = argparse.ArgumentParser(description="Upbit 암호화폐 수집기")
    parser.add_argument("--date", default=str(date.today() - timedelta(days=1)),
                        help="수집 날짜 YYYY-MM-DD")
    parser.add_argument("--output", default=OUTPUT_ROOT)
    parser.add_argument("--markets", nargs="+", default=DEFAULT_MARKETS,
                        help="마켓 코드 목록 (기본: 주요 10개)")
    parser.add_argument("--all", action="store_true",
                        help="Upbit KRW 전체 마켓 수집")
    args = parser.parse_args()

    markets = get_all_krw_markets() if args.all else args.markets
    run(markets, date.fromisoformat(args.date), args.output)


if __name__ == "__main__":
    main()
