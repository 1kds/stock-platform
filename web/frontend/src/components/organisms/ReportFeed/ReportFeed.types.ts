import type { TrackingResponse, Top3Response } from "@/lib/api";

export interface ReportFeedProps {
  /** 추천 이력에서 리포트 피드를 파생 */
  rows: TrackingResponse["history"];
  /** 오늘의 Top3 상세 점수 — 날짜가 일치하는 카드의 펼침 영역을 점수바·서술로 보강. */
  detail?: Top3Response | null;
  className?: string;
}
