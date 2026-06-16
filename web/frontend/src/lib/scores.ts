// 점수 7항목 메타데이터 — common.md 5장 점수 체계의 단일 진실 공급원.
// 라벨/최대 배점이 여러 컴포넌트(Top3Card·StockDetailModal·백테스팅)에서
// 중복 정의되던 것을 여기로 모은다. 순서는 화면 표시 순서를 유지한다.

import type { ScoreBreakdown } from "@/lib/api";

/** risk_penalty를 제외한 가점 6항목의 key. */
export type ScoreItemKey = Exclude<keyof ScoreBreakdown, "risk_penalty">;

export interface ScoreItemMeta {
  key: ScoreItemKey;
  /** 한국어 표시 라벨. */
  label: string;
  /** 최대 배점. */
  max: number;
}

/** 가점 6항목 (저평가·수급·거래량·뉴스·모멘텀·실적). 표시 순서 유지. */
export const SCORE_ITEMS: readonly ScoreItemMeta[] = [
  { key: "undervaluation", label: "저평가", max: 25 },
  { key: "investor_flow", label: "수급", max: 20 },
  { key: "volume_spike", label: "거래량", max: 15 },
  { key: "news_keyword", label: "뉴스", max: 10 },
  { key: "momentum", label: "모멘텀", max: 20 },
  { key: "earnings", label: "실적", max: 10 },
] as const;

/** 리스크 감점 항목의 최대값(점수바 비율 계산용). */
export const RISK_PENALTY_MAX = 15;

/** 점수 등급. ScoreBadge 색·시장 분포 집계가 공유하는 단일 기준. */
export type ScoreTier = "high" | "mid" | "low";

/** 최종 점수 → 등급 (≥80 고 / ≥60 중 / 그 외 저). 임계값은 여기 한 곳. */
export function scoreTier(score: number): ScoreTier {
  if (score >= 80) return "high";
  if (score >= 60) return "mid";
  return "low";
}

/** 가점 6항목 중 (점수/최대) 비율이 높은 상위 n개. Top3 카드 강점 태그용. */
export function topStrengths(scores: ScoreBreakdown, n = 3): ScoreItemMeta[] {
  return [...SCORE_ITEMS]
    .sort((a, b) => scores[b.key] / b.max - scores[a.key] / a.max)
    .slice(0, n);
}
