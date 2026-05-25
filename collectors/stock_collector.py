"""
pykrx 기반 국내 주식 OHLCV·수급 수집기 (팀 공통 스펙 v2).

HDFS 경로:
  {HDFS_BASE}/data/stock/ohlcv/year={Y}/month={M}/day={D}/part-0.parquet
  {HDFS_BASE}/data/stock/investor/year={Y}/month={M}/day={D}/part-0.parquet
"""

import os
import logging
import argparse
from datetime import date, timedelta

import pandas as pd
from pykrx import stock

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

HDFS_BASE = os.environ.get("HDFS_BASE", "/tmp/stock-data")
PANEL_DAYS = 252       # 52주 = 약 252 거래일
TOP_N_INVESTOR = 300   # 수급 수집 대상 (시총 상위 N종목)


def _hdfs_dir(base: str, data_type: str, d: date) -> str:
    return os.path.join(
        base, "data", "stock", data_type,
        f"year={d.year}", f"month={d.month:02d}", f"day={d.day:02d}",
    )


def _save(df: pd.DataFrame, dir_path: str) -> None:
    os.makedirs(dir_path, exist_ok=True)
    path = os.path.join(dir_path, "part-0.parquet")
    df.to_parquet(path, index=False)
    log.info("저장: %s (%d rows)", path, len(df))


def _trading_dates(target_date: date, n: int) -> list[date]:
    """삼성전자(005930) 기준 최근 n 거래일 목록 반환 (오름차순, target_date 포함)."""
    start = target_date - timedelta(days=n * 2)
    df = stock.get_market_ohlcv_by_date(
        start.strftime("%Y%m%d"), target_date.strftime("%Y%m%d"), "005930"
    )
    if df.empty:
        return [target_date]
    dates = sorted(d.date() for d in df.index)
    return dates[-n:]


def _fetch_market_panel(trading_dates: list[date]) -> pd.DataFrame:
    """날짜 목록에 대한 시장 전체 OHLCV 패널 DataFrame 구성."""
    frames = []
    total = len(trading_dates) * 2
    for i, d in enumerate(trading_dates, 1):
        date_str = d.strftime("%Y%m%d")
        for market in ("KOSPI", "KOSDAQ"):
            try:
                df = stock.get_market_ohlcv(date_str, market=market)
                if df.empty:
                    continue
                df.index.name = "symbol"
                df = df.reset_index()
                df = df.rename(columns={
                    "시가": "open", "고가": "high", "저가": "low", "종가": "close",
                    "거래량": "volume", "거래대금": "trade_value",
                    "등락률": "change_rate", "시가총액": "market_cap",
                })
                df["date"] = d
                df["symbol"] = df["symbol"].astype(str).str.zfill(6)
                frames.append(df)
            except Exception as e:
                log.debug("패널 조회 실패 (%s %s): %s", d, market, e)
        if i % 20 == 0:
            log.info("패널 진행: %d/%d 날짜 처리완료", i, len(trading_dates))
    if not frames:
        return pd.DataFrame()
    panel = pd.concat(frames, ignore_index=True)
    return panel[panel["close"] > 0].copy()


def _get_names(target_date: date) -> dict[str, str]:
    """종목코드(6자리) → 종목명 딕셔너리 반환."""
    date_str = target_date.strftime("%Y%m%d")
    names: dict[str, str] = {}
    for market in ("KOSPI", "KOSDAQ"):
        try:
            for sym in stock.get_market_ticker_list(date_str, market=market):
                names[str(sym).zfill(6)] = stock.get_market_ticker_name(sym)
        except Exception as e:
            log.warning("종목명 조회 실패 (%s): %s", market, e)
    return names


def _compute_ohlcv(panel: pd.DataFrame, target_date: date, names: dict[str, str]) -> pd.DataFrame:
    """패널에서 당일 OHLCV + 파생 지표를 groupby+rolling으로 벡터화 계산."""
    p = panel.sort_values(["symbol", "date"]).reset_index(drop=True)
    g = p.groupby("symbol", sort=False)

    p["ma5"]            = g["close"].transform(lambda x: x.rolling(5,   min_periods=1).mean())
    p["ma20"]           = g["close"].transform(lambda x: x.rolling(20,  min_periods=1).mean())
    p["ma60"]           = g["close"].transform(lambda x: x.rolling(60,  min_periods=1).mean())
    p["volume_avg_20"]  = g["volume"].transform(lambda x: x.rolling(20, min_periods=1).mean())
    p["volume_ratio_20"] = p["volume"] / p["volume_avg_20"]
    p["prev_close"]     = g["close"].transform(lambda x: x.shift(1))
    p["close_5d_ago"]   = g["close"].transform(lambda x: x.shift(5))
    p["close_20d_ago"]  = g["close"].transform(lambda x: x.shift(20))
    p["high_52w"]       = g["high"].transform(lambda x: x.rolling(252, min_periods=1).max())
    p["low_52w"]        = g["low"].transform(lambda x: x.rolling(252,  min_periods=1).min())
    p["_ret"]           = g["close"].transform(lambda x: x.pct_change())
    p["volatility_20"]  = g["_ret"].transform(
        lambda x: x.rolling(20, min_periods=2).std() * (252 ** 0.5)
    )

    today = p[p["date"] == target_date].copy()
    today["name"] = today["symbol"].map(names).fillna("")
    today["date"] = target_date.isoformat()

    cols = [
        "symbol", "name", "date",
        "open", "high", "low", "close", "volume", "trade_value", "change_rate", "market_cap",
        "prev_close", "close_5d_ago", "close_20d_ago",
        "ma5", "ma20", "ma60",
        "volume_avg_20", "volume_ratio_20",
        "high_52w", "low_52w", "volatility_20",
    ]
    return today[[c for c in cols if c in today.columns]].reset_index(drop=True)


def _investor_net(df: pd.DataFrame, keyword: str) -> float | None:
    """투자자별 DataFrame에서 keyword 포함 행의 순매수 값 반환."""
    df_r = df.reset_index()
    id_col = df_r.columns[0]
    net_col = next((c for c in df_r.columns if "순매수" in c), None)
    if net_col is None:
        return None
    subset = df_r[df_r[id_col].astype(str).str.contains(keyword, na=False)]
    return float(subset[net_col].iloc[0]) if not subset.empty else None


def _collect_investor(
    top_syms: list[str], trading_dates: list[date], target_date: date
) -> pd.DataFrame:
    """투자자 수급 데이터 수집 (시총 상위 TOP_N_INVESTOR 종목)."""
    end_str = target_date.strftime("%Y%m%d")

    # 외국인 보유비율 — 시장 전체 일괄 조회 (2회 호출)
    holding: dict[str, float] = {}
    for market in ("KOSPI", "KOSDAQ"):
        try:
            df = stock.get_exhaustion_rates_of_foreign_investment(end_str, end_str, market)
            if not df.empty:
                df.index = df.index.astype(str).str.zfill(6)
                ratio_col = next((c for c in df.columns if "보유" in c or "지분" in c), None)
                if ratio_col:
                    holding.update(df[ratio_col].to_dict())
        except Exception as e:
            log.warning("외국인 보유비율 조회 실패 (%s): %s", market, e)

    sampled = top_syms[:TOP_N_INVESTOR]
    log.info("수급 수집 종목: %d개 (시총 상위)", len(sampled))
    rows = []

    for idx, sym in enumerate(sampled, 1):
        row: dict = {"symbol": sym, "date": target_date.isoformat()}

        # 기간별 (1d/2d/3d/5d) 투자자 순매수 (주식수)
        for p in (1, 2, 3, 5):
            start_d = trading_dates[-p] if len(trading_dates) >= p else trading_dates[0]
            start_str = start_d.strftime("%Y%m%d")
            try:
                df_vol = stock.get_market_trading_volume_by_investor(start_str, end_str, sym)
                row[f"foreign_net_buy_{p}d"]     = _investor_net(df_vol, "외국인")
                row[f"institution_net_buy_{p}d"] = _investor_net(df_vol, "기관")
                row[f"individual_net_buy_{p}d"]  = _investor_net(df_vol, "개인")
            except Exception:
                for k in ("foreign", "institution", "individual"):
                    row.setdefault(f"{k}_net_buy_{p}d", None)

        # 외국인 순매수 금액 (1일)
        try:
            df_val = stock.get_market_trading_value_by_investor(end_str, end_str, sym)
            row["foreign_net_amount_1d"] = _investor_net(df_val, "외국인")
        except Exception:
            row["foreign_net_amount_1d"] = None

        row["foreign_holding_ratio"] = holding.get(sym)

        if idx % 50 == 0:
            log.info("수급 진행: %d/%d", idx, len(sampled))
        rows.append(row)

    return pd.DataFrame(rows)


def run(target_date: date, hdfs_base: str) -> None:
    log.info("수집 날짜: %s", target_date)

    log.info("거래일 목록 조회 중 (최대 %d일)...", PANEL_DAYS)
    trading_dates = _trading_dates(target_date, PANEL_DAYS)
    log.info("거래일 %d일 확보 (%s ~ %s)", len(trading_dates), trading_dates[0], trading_dates[-1])

    log.info("시장 OHLCV 패널 구성 중 (%d거래일 × KOSPI+KOSDAQ)...", len(trading_dates))
    panel = _fetch_market_panel(trading_dates)
    if panel.empty:
        log.error("패널 데이터 없음 — KRX 연결 실패 또는 휴장일 확인 필요")
        return

    today_syms = panel[panel["date"] == target_date]
    if today_syms.empty:
        log.warning("당일(%s) OHLCV 없음 — 휴장일일 수 있습니다.", target_date)
        return
    log.info("당일 종목 수: %d", len(today_syms))

    log.info("종목명 조회 중...")
    names = _get_names(target_date)

    log.info("파생 지표 계산 중...")
    ohlcv_df = _compute_ohlcv(panel, target_date, names)
    _save(ohlcv_df, _hdfs_dir(hdfs_base, "ohlcv", target_date))

    # 수급: 시총 상위 순 정렬
    top_syms = today_syms.sort_values("market_cap", ascending=False)["symbol"].tolist()

    log.info("투자자 수급 수집 중 (시총 상위 %d종목)...", TOP_N_INVESTOR)
    investor_df = _collect_investor(top_syms, trading_dates, target_date)
    _save(investor_df, _hdfs_dir(hdfs_base, "investor", target_date))

    log.info("완료 — OHLCV: %d종목, 수급: %d종목", len(ohlcv_df), len(investor_df))


def main() -> None:
    parser = argparse.ArgumentParser(description="pykrx 주식 데이터 수집기 (팀 스펙 v2)")
    parser.add_argument("--date", default=str(date.today() - timedelta(days=1)),
                        help="수집 날짜 YYYY-MM-DD (기본: 전일)")
    parser.add_argument("--base", default=HDFS_BASE, help="HDFS 기본 경로")
    args = parser.parse_args()
    run(date.fromisoformat(args.date), args.base)


if __name__ == "__main__":
    main()
