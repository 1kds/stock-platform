import type { TrackingResponse } from "@/lib/api";

export interface TrackingTableProps {
  rows: TrackingResponse["history"];
  className?: string;
}
