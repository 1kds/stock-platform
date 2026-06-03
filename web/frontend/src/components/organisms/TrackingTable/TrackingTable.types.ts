import type { TrackingResponse } from "@/lib/api";

/** 기간 필터 라벨(페이지 Segmented와 동일 문자열). */
export type TrackingPeriod = "최근 1주" | "최근 1개월" | "전체";

export interface TrackingTableProps {
  rows: TrackingResponse["history"];
  /** 기간 필터. 생략 시 "전체". */
  period?: TrackingPeriod;
  className?: string;
}
