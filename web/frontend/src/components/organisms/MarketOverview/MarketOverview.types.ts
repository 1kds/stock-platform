import type { MarketSummary } from "@/lib/marketSummary";

export interface MarketOverviewProps {
  /** 전체 종목 점수 집계 (lib/marketSummary.summarizeScores). */
  summary: MarketSummary;
  className?: string;
}
