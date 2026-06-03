"""Pydantic 응답 모델 — common.md 4·6장 계약 기준.

FastAPI 자동 문서(/docs)에 그대로 노출되어 프론트와의 계약서 역할.
"""

from pydantic import BaseModel


# ---------- /api/top3 ----------
class ScoreBreakdown(BaseModel):
    undervaluation: int
    investor_flow: int
    volume_spike: int
    news_keyword: int
    momentum: int
    earnings: int
    risk_penalty: int


class Top3Item(BaseModel):
    rank: int
    symbol: str
    name: str
    final_score: int
    scores: ScoreBreakdown
    reason: str


class Top3Response(BaseModel):
    date: str
    updated_at: str
    top3: list[Top3Item]


# ---------- /api/scores ----------
class ScoreRow(BaseModel):
    rank: int
    symbol: str
    name: str
    sector: str
    date: str
    undervaluation_score: int
    investor_flow_score: int
    volume_spike_score: int
    news_keyword_score: int
    momentum_score: int
    earnings_score: int
    risk_penalty: int
    final_score: int


class ScoresResponse(BaseModel):
    date: str
    count: int
    scores: list[ScoreRow]


# ---------- /api/tracking ----------
class TrackingSummary(BaseModel):
    hit_rate: float
    avg_return: float
    updated_at: str


class ReturnPoint(BaseModel):
    date: str
    return_: float

    # JSON 키는 "return" (파이썬 예약어 회피)
    model_config = {"populate_by_name": True}


class HistoryTop3(BaseModel):
    rank: int
    symbol: str
    name: str


class HistoryRow(BaseModel):
    date: str
    top3: list[HistoryTop3]
    avg_return_t3: float
    avg_return_t5: float
    hit: bool


class TrackingResponse(BaseModel):
    summary: TrackingSummary
    return_chart: list[dict]
    history: list[HistoryRow]


# ---------- /api/backtest ----------
class Horizon(BaseModel):
    horizon: str
    top3_return: float
    market_return: float
    excess: float


class BacktestSummary(BaseModel):
    avg_return: float
    win_rate: float
    max_drawdown: float


class BacktestResponse(BaseModel):
    period: dict
    hold: int
    indicators: list[str]
    summary: BacktestSummary
    returns_by_horizon: list[Horizon]
