import type { TrackingResponse } from "@/lib/api";

export interface ReportFeedProps {
  /** 추천 이력에서 리포트 피드를 파생 */
  rows: TrackingResponse["history"];
  className?: string;
}
