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
import type { ScoresTableProps } from "./ScoresTable.types";

/** 전체 종목 점수 테이블. 순위·종목·업종·최종점수 + 주요 항목 점수. */
export function ScoresTable({ rows, className }: ScoresTableProps) {
  return (
    <div className={cn("rounded-md border border-border bg-card p-1", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">순위</TableHead>
            <TableHead>종목</TableHead>
            <TableHead>업종</TableHead>
            <TableHead className="text-center">최종점수</TableHead>
            <TableHead className="text-right">저평가</TableHead>
            <TableHead className="text-right">수급</TableHead>
            <TableHead className="text-right">거래량</TableHead>
            <TableHead className="text-right">모멘텀</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.symbol}>
              <TableCell className="text-center font-bold text-muted-foreground">
                {r.rank}
              </TableCell>
              <TableCell>
                <span className="font-semibold text-foreground">{r.name}</span>{" "}
                <span className="text-xs text-muted-foreground">{r.symbol}</span>
              </TableCell>
              <TableCell className="text-muted-foreground">{r.sector}</TableCell>
              <TableCell className="text-center">
                <ScoreBadge score={r.final_score} />
              </TableCell>
              <TableCell className="text-right tabular-nums">{r.undervaluation_score}</TableCell>
              <TableCell className="text-right tabular-nums">{r.investor_flow_score}</TableCell>
              <TableCell className="text-right tabular-nums">{r.volume_spike_score}</TableCell>
              <TableCell className="text-right tabular-nums">{r.momentum_score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
