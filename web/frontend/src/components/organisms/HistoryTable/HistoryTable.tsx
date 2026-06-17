"use client";

import { useState } from "react";
import { Check, X, History, Minus, Plus } from "lucide-react";
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
  title = "최근 추천 이력",
  className,
}: HistoryTableProps) {
  const [open, setOpen] = useState(true);
  return (
    <section className={cn("flex flex-col rounded-md border border-border bg-card shadow-sm", className)}>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <History className="size-4 text-muted-foreground" aria-hidden />
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "이력 접기" : "이력 펼치기"}
          className="inline-flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {open ? <Minus className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
        </button>
      </div>
      {open && (
      <Table>
        <TableHeader>
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
      )}
    </section>
  );
}
