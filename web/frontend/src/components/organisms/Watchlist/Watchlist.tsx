import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScoreBadge } from "@/components/atoms/ScoreBadge";
import type { WatchlistProps } from "./Watchlist.types";

/** Top3 다음 후보(4~10위) 간략 리스트 — 읽기 전용 + 전체 보기 링크. */
export function Watchlist({ rows, href = "/scores", className }: WatchlistProps) {
  return (
    <section className={cn("flex flex-col rounded-md border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold text-foreground">그 다음 후보</h2>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          전체 보기 <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">순위</TableHead>
            <TableHead>종목</TableHead>
            <TableHead className="w-20">시장</TableHead>
            <TableHead className="w-16 text-right">점수</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.symbol}>
              <TableCell className="tabular-nums text-muted-foreground">{r.rank}</TableCell>
              <TableCell>
                <span className="font-medium text-foreground">{r.name}</span>
                <span className="ml-1.5 text-xs text-muted-foreground">{r.symbol}</span>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{r.market ?? "—"}</TableCell>
              <TableCell className="text-right">
                <ScoreBadge score={r.final_score} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
