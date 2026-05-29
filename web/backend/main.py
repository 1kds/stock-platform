"""8팀 주식 분석 플랫폼 — FastAPI 백엔드.

HDFS의 분석 결과를 읽어 REST API로 제공한다 (읽기 전용).
1단계: Mock JSON 반환. 3단계: data_source.py를 HDFS(pyarrow)로 교체.

실행: uvicorn main:app --reload --port 8000
문서: http://localhost:8000/docs
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

import config
import data_source
from schemas import (
    BacktestResponse,
    ScoresResponse,
    Top3Response,
    TrackingResponse,
)

app = FastAPI(
    title="8팀 주식 분석 API",
    description="Spark 분석 결과(Top3·점수·백테스팅·트래킹)를 HDFS에서 읽어 제공",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_origin_regex=r"http://localhost:\d+",  # 개발 중 localhost 모든 포트 허용(3000/3001 등)
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
def health():
    """K8s Liveness Probe용 헬스체크."""
    return {"status": "ok", "use_mock": config.USE_MOCK}


@app.get("/api/top3", response_model=Top3Response, tags=["analysis"])
def top3(date: str | None = Query(None, description="YYYY-MM-DD, 없으면 최신")):
    """오늘의 Top3 추천 종목."""
    return data_source.get_top3(date)


@app.get("/api/scores", response_model=ScoresResponse, tags=["analysis"])
def scores(date: str | None = Query(None, description="YYYY-MM-DD, 없으면 최신")):
    """전체 종목 항목별 점수."""
    return data_source.get_scores(date)


@app.get("/api/tracking", response_model=TrackingResponse, tags=["analysis"])
def tracking(period: str = Query("all", description="1w | 1m | all")):
    """추천 이력 및 적중률."""
    return data_source.get_tracking(period)


@app.get("/api/backtest", response_model=BacktestResponse, tags=["analysis"])
def backtest(
    start: str = Query(..., description="시작일 YYYY-MM-DD"),
    end: str = Query(..., description="종료일 YYYY-MM-DD"),
    hold: int = Query(5, description="보유 기간(거래일): 1 | 3 | 5 | 20"),
):
    """백테스팅 — 기간별 수익률·승률·최대 낙폭."""
    return data_source.get_backtest(start, end, hold)
