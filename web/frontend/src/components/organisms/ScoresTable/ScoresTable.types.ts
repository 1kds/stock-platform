import type { ScoreRow } from "@/lib/api";

/** 정렬 가능한 점수 컬럼 key. */
export type ScoreSortKey =
  | "final_score"
  | "undervaluation_score"
  | "investor_flow_score"
  | "volume_spike_score"
  | "news_keyword_score"
  | "momentum_score"
  | "earnings_score"
  | "name";

export interface ScoresTableProps {
  /** 전체 데이터셋. 필터/정렬은 organism 내부 상태로 처리. */
  rows: ScoreRow[];
  className?: string;
}
