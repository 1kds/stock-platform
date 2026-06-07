"""
DART Open API + pykrx 기반 재무지표 및 공시 수집기 (팀 공통 스펙 v2).

HDFS 경로:
  {HDFS_BASE}/data/stock/financial/year={Y}/month={M}/day={D}/part-0.parquet
  {HDFS_BASE}/data/stock/news/year={Y}/month={M}/day={D}/dart-disclosures.parquet

환경변수: DART_API_KEY
"""

import io
import os
import time
import zipfile
import logging
import argparse
from datetime import date

import requests
import pandas as pd
from pykrx import stock as pykrx_stock

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

DART_API_KEY = os.environ.get("DART_API_KEY", "")
HDFS_BASE    = os.environ.get("HDFS_BASE", "/tmp/stock-data")
DART_BASE    = "https://opendart.fss.or.kr/api"

FIN_IDS = {
    "매출액":   "ifrs-full_Revenue",
    "영업이익": "dart_OperatingIncomeLoss",
    "부채총계": "ifrs-full_Liabilities",
    "자본총계": "ifrs-full_Equity",
}


def _hdfs_dir(base: str, data_type: str, d: date) -> str:
    return os.path.join(
        base, "data", "stock", data_type,
        f"year={d.year}", f"month={d.month:02d}", f"day={d.day:02d}",
    )


def _save(df: pd.DataFrame, dir_path: str, filename: str = "part-0.parquet") -> None:
    os.makedirs(dir_path, exist_ok=True)
    path = os.path.join(dir_path, filename)
    df.to_parquet(path, index=False)
    log.info("저장: %s (%d rows)", path, len(df))


def _dart_get(endpoint: str, params: dict) -> dict:
    params["crtfc_key"] = DART_API_KEY
    resp = requests.get(f"{DART_BASE}/{endpoint}.json", params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()


def get_corp_codes() -> pd.DataFrame:
    """전체 상장 기업 corp_code ↔ stock_code 매핑 반환."""
    resp = requests.get(
        f"{DART_BASE}/corpCode.xml",
        params={"crtfc_key": DART_API_KEY},
        timeout=60,
    )
    resp.raise_for_status()
    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        with zf.open("CORPCODE.xml") as f:
            df = pd.read_xml(f)
    df = df[df["stock_code"].notna() & (df["stock_code"].str.strip() != "")]
    df["stock_code"] = df["stock_code"].str.strip().str.zfill(6)
    df["corp_code"]  = df["corp_code"].astype(str).str.zfill(8)
    log.info("상장 기업 수: %d", len(df))
    return df[["corp_code", "stock_code", "corp_name"]].reset_index(drop=True)


def _get_fundamentals(target_date: date) -> pd.DataFrame:
    """pykrx 시장 전체 재무비율 수집 (PER, PBR, EPS, BPS, 배당수익률)."""
    date_str = target_date.strftime("%Y%m%d")
    frames = []
    for market in ("KOSPI", "KOSDAQ"):
        try:
            df = pykrx_stock.get_market_fundamental(date_str, market=market)
            if df.empty:
                continue
            df.index.name = "symbol"
            df = df.reset_index()
            df["symbol"] = df["symbol"].astype(str).str.zfill(6)
            frames.append(df)
        except Exception as e:
            log.warning("pykrx 재무비율 조회 실패 (%s): %s", market, e)
    if not frames:
        return pd.DataFrame()
    fund = pd.concat(frames, ignore_index=True)
    fund = fund.rename(columns={
        "BPS": "bps", "PER": "per", "PBR": "pbr",
        "EPS": "eps", "DIV": "dividend_yield", "DPS": "dps",
    })
    # ROE ≈ EPS / BPS × 100 (근사값; 정확한 값은 DART 재무제표 기반)
    if "eps" in fund.columns and "bps" in fund.columns:
        fund["roe"] = (fund["eps"] / fund["bps"].replace(0, float("nan")) * 100).round(2)
    return fund


def _get_market_cap(target_date: date) -> pd.DataFrame:
    """pykrx 시가총액 수집."""
    date_str = target_date.strftime("%Y%m%d")
    frames = []
    for market in ("KOSPI", "KOSDAQ"):
        try:
            df = pykrx_stock.get_market_ohlcv(date_str, market=market)
            if df.empty:
                continue
            df.index.name = "symbol"
            df = df.reset_index()
            df["symbol"] = df["symbol"].astype(str).str.zfill(6)
            col = next((c for c in df.columns if "시가총액" in c), None)
            if col:
                df = df.rename(columns={col: "market_cap"})
                frames.append(df[["symbol", "market_cap"]])
        except Exception as e:
            log.debug("시가총액 조회 실패 (%s): %s", market, e)
    return pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()


def _get_sector_info(target_date: date) -> pd.DataFrame:
    """pykrx 업종 분류 수집."""
    date_str = target_date.strftime("%Y%m%d")
    frames = []
    for market in ("KOSPI", "KOSDAQ"):
        try:
            df = pykrx_stock.get_market_sector_classifications(date_str, market=market)
            if df.empty:
                continue
            df.index.name = "symbol"
            df = df.reset_index()
            df["symbol"] = df["symbol"].astype(str).str.zfill(6)
            col = next((c for c in df.columns if "업종" in c or "sector" in c.lower()), None)
            if col:
                frames.append(df[["symbol", col]].rename(columns={col: "sector"}))
        except Exception as e:
            log.debug("업종 정보 조회 실패 (%s): %s", market, e)
    return pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()


def _collect_dart_financials(corp_df: pd.DataFrame, year: int) -> pd.DataFrame:
    """DART 사업보고서에서 부채비율·영업이익률·성장률 계산."""
    records = []
    total = len(corp_df)

    for idx, row in corp_df.iterrows():
        symbol    = row["stock_code"]
        corp_code = row["corp_code"]
        try:
            data = _dart_get("fnlttSinglAcntAll", {
                "corp_code": corp_code,
                "bsns_year": str(year),
                "reprt_code": "11011",  # 사업보고서
                "fs_div": "CFS",        # 연결재무제표
            })
            if data.get("status") != "000":
                continue

            fin: dict[str, int] = {}
            prev: dict[str, int] = {}
            for item in data.get("list", []):
                acc_id = item.get("account_id", "")
                label  = next((k for k, v in FIN_IDS.items() if v == acc_id), None)
                if label is None:
                    continue
                try:
                    fin[label]  = int(str(item.get("thstrm_amount", "0")).replace(",", "") or 0)
                    prev[label] = int(str(item.get("frmtrm_amount", "0")).replace(",", "") or 0)
                except ValueError:
                    pass

            rev    = fin.get("매출액", 0)
            op     = fin.get("영업이익", 0)
            debt   = fin.get("부채총계", 0)
            equity = fin.get("자본총계", 0) or 1
            prev_rev = prev.get("매출액", 0) or 1
            prev_op  = prev.get("영업이익", 0) or 1

            records.append({
                "symbol":                   symbol,
                "debt_ratio":               round(debt / equity * 100, 2) if equity else None,
                "operating_margin":         round(op / rev * 100, 2) if rev else None,
                "revenue_growth":           round((rev - prev.get("매출액", 0)) / abs(prev_rev) * 100, 2),
                "operating_profit_growth":  round((op  - prev.get("영업이익", 0)) / abs(prev_op) * 100, 2),
            })
        except Exception as e:
            log.debug("DART 재무 실패 (%s): %s", symbol, e)

        if (idx + 1) % 100 == 0:
            log.info("DART 재무 진행: %d/%d", idx + 1, total)
        time.sleep(0.3)

    return pd.DataFrame(records)


def _collect_disclosures(corp_df: pd.DataFrame, target_date: date) -> pd.DataFrame:
    """DART 당일 공시 목록 → news 테이블 형식으로 반환."""
    date_str = target_date.strftime("%Y%m%d")
    records = []

    for _, row in corp_df.iterrows():
        symbol    = row["stock_code"]
        corp_code = row["corp_code"]
        try:
            data = _dart_get("list", {
                "corp_code": corp_code,
                "bgn_de": date_str,
                "end_de": date_str,
                "page_count": 10,
            })
            if data.get("status") != "000":
                continue
            for item in data.get("list", []):
                rcept_dt = str(item.get("rcept_dt", date_str))
                records.append({
                    "symbol":       symbol,
                    "date":         target_date.isoformat(),
                    "published_at": rcept_dt[:8].replace("", "-") if len(rcept_dt) == 8 else rcept_dt,
                    "source":       "dart",
                    "title":        item.get("report_nm", ""),
                })
        except Exception as e:
            log.debug("공시 수집 실패 (%s): %s", symbol, e)
        time.sleep(0.2)

    return pd.DataFrame(records)


def _build_financial_df(
    fund: pd.DataFrame,
    dart_fin: pd.DataFrame,
    sectors: pd.DataFrame,
    mktcap: pd.DataFrame,
    corp_df: pd.DataFrame,
) -> pd.DataFrame:
    """모든 재무 데이터를 병합하고 sector별 per_q25·pbr_q25 계산."""
    base = fund.copy()

    if not dart_fin.empty:
        base = base.merge(dart_fin, on="symbol", how="left")
    if not sectors.empty:
        base = base.merge(sectors, on="symbol", how="left")
    if not mktcap.empty:
        base = base.merge(mktcap, on="symbol", how="left")

    name_map = corp_df.set_index("stock_code")["corp_name"].to_dict()
    base["name"] = base["symbol"].map(name_map).fillna("")

    # sector별 PER·PBR 25th percentile
    if "sector" in base.columns and "per" in base.columns:
        valid = base[(base["per"] > 0) & base["sector"].notna()]
        q25_per = valid.groupby("sector")["per"].quantile(0.25).rename("per_q25")
        base = base.merge(q25_per.reset_index(), on="sector", how="left")
        if "pbr" in base.columns:
            q25_pbr = valid.groupby("sector")["pbr"].quantile(0.25).rename("pbr_q25")
            base = base.merge(q25_pbr.reset_index(), on="sector", how="left")
    else:
        # sector 없으면 전체 시장 기준
        for col in ("per", "pbr"):
            if col in base.columns:
                valid = base[base[col] > 0][col]
                base[f"{col}_q25"] = valid.quantile(0.25) if not valid.empty else None

    cols = [
        "symbol", "name", "sector",
        "per", "pbr", "roe", "eps", "bps", "dividend_yield",
        "per_q25", "pbr_q25", "market_cap",
        "debt_ratio", "operating_margin", "revenue_growth", "operating_profit_growth",
    ]
    return base[[c for c in cols if c in base.columns]].reset_index(drop=True)


def run(target_date: date, hdfs_base: str) -> None:
    if not DART_API_KEY:
        raise EnvironmentError("환경변수 DART_API_KEY가 필요합니다.")

    log.info("수집 날짜: %s", target_date)
    fin_year = target_date.year if target_date.month > 3 else target_date.year - 1

    log.info("기업 코드 다운로드 중...")
    corp_df = get_corp_codes()

    log.info("pykrx 재무비율 수집 중...")
    fund = _get_fundamentals(target_date)

    log.info("업종 정보 수집 중...")
    sectors = _get_sector_info(target_date)

    log.info("시가총액 수집 중...")
    mktcap = _get_market_cap(target_date)

    log.info("DART 재무제표 수집 중 (사업연도: %d)...", fin_year)
    dart_fin = _collect_dart_financials(corp_df, fin_year)

    log.info("재무 데이터 병합 및 분위수 계산 중...")
    financial_df = _build_financial_df(fund, dart_fin, sectors, mktcap, corp_df)
    financial_df["date"] = target_date.isoformat()
    _save(financial_df, _hdfs_dir(hdfs_base, "financial", target_date))

    log.info("DART 당일 공시 수집 중...")
    disc_df = _collect_disclosures(corp_df, target_date)
    if not disc_df.empty:
        _save(disc_df, _hdfs_dir(hdfs_base, "news", target_date), "dart-disclosures.parquet")

    log.info("완료 — 재무: %d종목, 공시: %d건", len(financial_df), len(disc_df))


def main() -> None:
    parser = argparse.ArgumentParser(description="DART 재무/공시 수집기 (팀 스펙 v2)")
    parser.add_argument("--date", default=str(date.today()), help="수집 날짜 YYYY-MM-DD")
    parser.add_argument("--base", default=HDFS_BASE, help="HDFS 기본 경로")
    args = parser.parse_args()
    run(date.fromisoformat(args.date), args.base)


if __name__ == "__main__":
    main()
