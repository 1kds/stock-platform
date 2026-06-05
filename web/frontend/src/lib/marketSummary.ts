// 전체 종목 점수(/api/scores)를 메인 대시보드용으로 집계하는 헬퍼.
// 등급 임계값은 lib/scores.ts scoreTier()를 재사용한다(중복 금지).

import type { ScoreRow } from "@/lib/api";
import { scoreTier } from "@/lib/scores";

export interface MarketSummary {
  /** 오늘 분석된 전체 종목 수. */
  total: number;
  /** 시장별 종목 수. */
  byMarket: { kospi: number; kosdaq: number };
  /** 평균 최종 점수(반올림). */
  avgScore: number;
  /** 점수 등급 분포(고/중/저). */
  tiers: { high: number; mid: number; low: number };
}

/** 전체 종목 행을 시장 요약으로 집계. */
export function summarizeScores(rows: ScoreRow[]): MarketSummary {
  const byMarket = { kospi: 0, kosdaq: 0 };
  const tiers = { high: 0, mid: 0, low: 0 };
  let sum = 0;
  for (const r of rows) {
    sum += r.final_score;
    if (r.market === "KOSPI") byMarket.kospi += 1;
    else if (r.market === "KOSDAQ") byMarket.kosdaq += 1;
    tiers[scoreTier(r.final_score)] += 1;
  }
  const total = rows.length;
  return { total, byMarket, avgScore: total ? Math.round(sum / total) : 0, tiers };
}

export interface SectorCount {
  sector: string;
  count: number;
}

/** 업종별 종목 수(많은 순). 업종 분포 차트용. */
export function sectorDistribution(rows: ScoreRow[]): SectorCount[] {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.sector, (m.get(r.sector) ?? 0) + 1);
  return [...m.entries()]
    .map(([sector, count]) => ({ sector, count }))
    .sort((a, b) => b.count - a.count);
}
