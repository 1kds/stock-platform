import type { TrackingResponse } from "@/lib/api";

export interface HistoryTableProps {
  rows: TrackingResponse["history"];
  title?: string;
  className?: string;
}
