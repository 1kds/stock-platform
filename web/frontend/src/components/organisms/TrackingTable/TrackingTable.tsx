import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendChip } from "@/components/atoms/TrendChip";
import type { TrackingResponse } from "@/lib/api";
import type { TrackingPeriod, TrackingTableProps } from "./TrackingTable.types";

const PERIOD_DAYS: Record<TrackingPeriod, number | null> = {
  "최근 1주": 7,
  "최근 1개월": 30,
  전체: null,
};

/**
 * 추천 이력을 기간으로 필터링한다(최신 행 기준 상대 일수).
 * 페이지의 KPI 계산과 테이블 표시가 동일 집합을 쓰도록 export.
 */
export function filterHistoryByPeriod(
  rows: TrackingResponse["history"],
  period: TrackingPeriod = "전체",
): TrackingResponse["history"] {
  const days = PERIOD_DAYS[period];
  if (!days || rows.length === 0) return rows;
  const latest = rows.reduce(
    (max, r) => (r.date > max ? r.date : max),
    rows[0].date,
  );
  const cutoff = new Date(latest);
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return rows.filter((r) => r.date >= cutoffStr);
}

/** 추천 이력 상세 테이블 (날짜 / 종목 / T+3 / T+5 / 적중). */
export function TrackingTable({ rows, period = "전체", className }: TrackingTableProps) {
  const visible = filterHistoryByPeriod(rows, period);
  return (
    <div className={cn("overflow-x-auto rounded-md border border-border bg-card p-1", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>날짜</TableHead>
            <TableHead>Top3 종목</TableHead>
            <TableHead className="text-right">T+3</TableHead>
            <TableHead className="text-right">T+5</TableHead>
            <TableHead className="text-center">적중</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((r) => (
            <TableRow key={r.date}>
              <TableCell className="text-muted-foreground">{r.date}</TableCell>
              <TableCell className="font-medium text-foreground">
                {r.top3.map((t) => t.name).join(" · ")}
              </TableCell>
              <TableCell className="text-right">
                <TrendChip value={r.avg_return_t3} />
              </TableCell>
              <TableCell className="text-right">
                <TrendChip value={r.avg_return_t5} />
              </TableCell>
              <TableCell className="text-center">
                {r.hit ? (
                  <>
                    <Check className="mx-auto size-4 text-accent" />
                    <span className="sr-only">적중</span>
                  </>
                ) : (
                  <>
                    <X className="mx-auto size-4 text-muted-foreground" />
                    <span className="sr-only">미적중</span>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
          {visible.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                해당 기간의 추천 이력이 없습니다
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
