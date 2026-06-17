import { Check, X, History } from "lucide-react";
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

/** 최근 추천 이력 테이블 (날짜 / Top3 / 평균수익률 / 적중). 행이 많으면 내부 스크롤(헤더 고정). */
export function HistoryTable({
  rows,
  title = "최근 추천 이력",
  className,
}: HistoryTableProps) {
  return (
    <section className={cn("flex flex-col rounded-md border border-border bg-card shadow-sm", className)}>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <History className="size-4 text-muted-foreground" aria-hidden />
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>
      {/* 행이 많아도 카드 높이는 고정 — 내부에서 세로 스크롤. 컬럼 헤더는 상단 고정. */}
      <div className="max-h-72 overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead className="pl-4">날짜</TableHead>
              <TableHead>Top3 종목</TableHead>
              <TableHead className="text-right">평균 수익률</TableHead>
              <TableHead className="pr-4 text-center">적중</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.date}>
                <TableCell className="pl-4 text-muted-foreground">{r.date}</TableCell>
                <TableCell className="font-medium text-foreground">
                  {r.top3.map((t) => t.name).join(" · ")}
                </TableCell>
                <TableCell className="text-right">
                  <TrendChip value={r.avg_return_t5} />
                </TableCell>
                <TableCell className="pr-4 text-center">
                  {r.hit ? (
                    <>
                      <Check aria-hidden className="mx-auto size-4 text-accent" />
                      <span className="sr-only">적중</span>
                    </>
                  ) : (
                    <>
                      <X aria-hidden className="mx-auto size-4 text-muted-foreground" />
                      <span className="sr-only">미적중</span>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
