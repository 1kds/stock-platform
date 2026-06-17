import type { Top3Item } from "@/lib/api";

export interface ReportDetailProps {
  /** 그날 추천 Top3 (이력 데이터 — 순위·종목명·코드). */
  stocks: { rank: number; symbol: string; name: string }[];
  /** 같은 날짜의 전체 점수 데이터(있을 때만). symbol로 매칭해 점수바·서술을 보강. */
  detail?: Top3Item[];
  /** 날짜 단위 결과 — 점수가 없는 종목의 설명 생성에 사용. */
  day: { avg_return_t5: number; hit: boolean };
  className?: string;
}
