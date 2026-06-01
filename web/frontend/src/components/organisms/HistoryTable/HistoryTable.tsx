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
import type { HistoryTableProps } from "./HistoryTable.types";

/** 최근 추천 이력 테이블 (날짜 / Top3 / 평균수익률 / 적중). */
export function HistoryTable({
  rows,
  title = "최근 5일 추천 이력",
  className,
}: HistoryTableProps) {
  return (
    <div className={cn("rounded-md border border-border bg-card p-5", className)}>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      <Table className="mt-3">
        <TableHeader>
          <TableRow>
            <TableHead>날짜</TableHead>
            <TableHead>Top3 종목</TableHead>
            <TableHead className="text-right">평균 수익률</TableHead>
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
                <TrendChip value={r.avg_return_t5} />
              </TableCell>
              <TableCell className="text-center">{r.hit ? "✅" : "❌"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
