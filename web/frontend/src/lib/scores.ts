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
