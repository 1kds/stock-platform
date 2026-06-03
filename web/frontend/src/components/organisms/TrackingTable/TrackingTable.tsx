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
import type { TrackingTableProps } from "./TrackingTable.types";

/** 추천 이력 상세 테이블 (날짜 / 종목 / T+3 / T+5 / 적중). */
export function TrackingTable({ rows, className }: TrackingTableProps) {
  return (
    <div className={cn("rounded-md border border-border bg-card p-1", className)}>
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
          {rows.map((r) => (
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
                  <Check className="mx-auto size-4 text-accent" />
                ) : (
                  <X className="mx-auto size-4 text-muted-foreground" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
