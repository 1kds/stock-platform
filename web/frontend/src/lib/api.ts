// FastAPI 백엔드 호출 클라이언트 + 타입.
// 타입은 backend/schemas.py (common.md 6장 계약)와 일치시킬 것.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

// ---------- /api/top3 ----------
export interface ScoreBreakdown {
  undervaluation: number;
  investor_flow: number;
  volume_spike: number;
  news_keyword: number;
  momentum: number;
  earnings: number;
  risk_penalty: number;
}
export interface Top3Item {
  rank: number;
  symbol: string;
  name: string;
  final_score: number;
  scores: ScoreBreakdown;
  reason: string;
}
export interface Top3Response {
  date: string;
  updated_at: string;
  top3: Top3Item[];
}

// ---------- /api/scores ----------
export interface ScoreRow {
  rank: number;
  symbol: string;
  name: string;
  sector: string;
  date: string;
  undervaluation_score: number;
  investor_flow_score: number;
  volume_spike_score: number;
  news_keyword_score: number;
  momentum_score: number;
  earnings_score: number;
  risk_penalty: number;
  final_score: number;
}
export interface ScoresResponse {
  date: string;
  count: number;
  scores: ScoreRow[];
}

// ---------- /api/tracking ----------
export interface TrackingResponse {
  summary: { hit_rate: number; avg_return: number; updated_at: string };
  return_chart: { date: string; return: number }[];
  history: {
    date: string;
    top3: { rank: number; symbol: string; name: string }[];
    avg_return_t3: number;
    avg_return_t5: number;
    hit: boolean;
  }[];
}

// ---------- /api/backtest ----------
export interface BacktestResponse {
  period: { start: string; end: string };
  hold: number;
  indicators: string[];
  summary: { avg_return: number; win_rate: number; max_drawdown: number };
  returns_by_horizon: {
    horizon: string;
    top3_return: number;
    market_return: number;
    excess: number;
  }[];
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export const getTop3 = () => get<Top3Response>("/api/top3");
export const getScores = () => get<ScoresResponse>("/api/scores");
export const getTracking = (period = "all") =>
  get<TrackingResponse>(`/api/tracking?period=${period}`);
export const getBacktest = (start: string, end: string, hold = 5) =>
  get<BacktestResponse>(`/api/backtest?start=${start}&end=${end}&hold=${hold}`);
