// 리포트 상세 패널용 헬퍼.
// 점수 7항목을 한 줄로 압축한 요약 + 점수 상위 항목을 "기사형 하이라이트"로 풀어 쓴다.
// 점수가 없는 과거 추천 이력은 순위·실제 결과만으로 간단한 설명을 만든다.
// 라벨/최대 배점의 단일 진실 공급원은 lib/scores.ts.

import type { Top3Item } from "@/lib/api";
import { SCORE_ITEMS, type ScoreItemKey } from "@/lib/scores";
import { signedPercent } from "@/lib/utils";

/** 가점 6항목을 (점수/최대) 비율로 정렬 — 앞이 강점. */
function rankedItems(item: Top3Item) {
  return [...SCORE_ITEMS]
    .map((m) => ({ ...m, ratio: item.scores[m.key] / m.max }))
    .sort((a, b) => b.ratio - a.ratio);
}

/** 7항목 점수를 한 줄로 압축한 요약 (점수바 대체). */
export function scoreSummaryLine(item: Top3Item): string {
  const parts = SCORE_ITEMS.map((m) => `${m.label} ${item.scores[m.key]}`);
  return `${parts.join(" · ")} · 리스크 −${item.scores.risk_penalty}`;
}

export interface ReportHighlight {
  /** 항목 라벨 (저평가/수급/…). */
  tag: string;
  /** 기사형 헤드라인. */
  title: string;
  /** 1~2문장 본문. */
  body: string;
}

/** 항목별 기사형 하이라이트 문구 (점수 근거 = common.md 5장 기준). */
const HIGHLIGHT: Record<ScoreItemKey, { title: string; body: string }> = {
  undervaluation: {
    title: "업종 평균을 밑도는 밸류에이션",
    body: "PER·PBR이 업종 25퍼센타일 이하 구간에 위치해 가격 매력이 부각됩니다.",
  },
  investor_flow: {
    title: "외국인·기관 매수 우위 지속",
    body: "최근 5거래일 외국인과 기관의 순매수가 이어지며 수급이 안정적입니다.",
  },
  volume_spike: {
    title: "평균을 웃도는 거래량 유입",
    body: "20일 평균 대비 거래량이 늘며 시장의 관심이 집중되고 있습니다.",
  },
  news_keyword: {
    title: "우호적인 뉴스·공시 흐름",
    body: "긍정 키워드의 뉴스·공시 비중이 높아 투자 심리에 우호적입니다.",
  },
  momentum: {
    title: "단기·중기 상승 모멘텀 유지",
    body: "5·20일 수익률과 이동평균 추세가 우상향을 그리고 있습니다.",
  },
  earnings: {
    title: "견조한 실적 성장세",
    body: "매출과 영업이익 성장률이 양호해 펀더멘털이 뒷받침됩니다.",
  },
};

/** 점수 상위 항목을 기사형 하이라이트로 변환 (상위 n개). */
export function reportHighlights(item: Top3Item, n = 3): ReportHighlight[] {
  return rankedItems(item)
    .slice(0, n)
    .map((m) => ({ tag: m.label, ...HIGHLIGHT[m.key] }));
}

/** 점수 데이터가 없는 과거 추천 이력용 간단 설명(순위 + 실제 결과). */
export function resultNarrative(rank: number, day: { avg_return_t5: number; hit: boolean }): string {
  const place = rank === 1 ? "최우선 추천" : `${rank}순위 추천`;
  const avg = signedPercent(day.avg_return_t5);
  const result = day.hit
    ? `추천 시점 대비 5거래일 평균 ${avg}로 적중했습니다.`
    : `추천 시점 대비 5거래일 평균 ${avg}로 목표 수익에는 미치지 못했습니다.`;
  return `이날의 ${place} 종목입니다. ${result}`;
}
