"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
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
import { SearchInput } from "@/components/molecules/SearchInput";
import { Dropdown } from "@/components/molecules/Dropdown";
import { Segmented } from "@/components/molecules/Segmented";
import { useTableControls } from "@/lib/useTableControls";
import type { ScoreRow } from "@/lib/api";
import type { ScoresTableProps, ScoreSortKey } from "./ScoresTable.types";

const MARKETS = ["전체", "KOSPI", "KOSDAQ"];

const SORT_OPTIONS: { value: ScoreSortKey; label: string }[] = [
  { value: "final_score", label: "점수 높은순" },
  { value: "undervaluation_score", label: "저평가순" },
  { value: "investor_flow_score", label: "수급순" },
  { value: "volume_spike_score", label: "거래량순" },
  { value: "momentum_score", label: "모멘텀순" },
  { value: "name", label: "종목명순" },
];

/** 정렬 화살표 아이콘 — 현재 정렬 컬럼/방향 반영. */
function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ChevronsUpDown className="size-3 opacity-40" />;
  return dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />;
}

/** 전체 종목 점수 테이블. 검색·업종·시장·정렬을 organism 내부 상태로 처리. */
export function ScoresTable({ rows, className }: ScoresTableProps) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("전체");
  const [market, setMarket] = useState("전체");

  const { sort, toggleSort, applySort } = useTableControls<ScoreRow, ScoreSortKey>({
    accessors: {
      final_score: (r) => r.final_score,
      undervaluation_score: (r) => r.undervaluation_score,
      investor_flow_score: (r) => r.investor_flow_score,
      volume_spike_score: (r) => r.volume_spike_score,
      momentum_score: (r) => r.momentum_score,
      name: (r) => r.name,
    },
    initialSort: { key: "final_score", dir: "desc" },
  });

  const sectorOptions = useMemo(() => {
    const set = Array.from(new Set(rows.map((r) => r.sector))).sort((a, b) =>
      a.localeCompare(b, "ko"),
    );
    return [
      { value: "전체", label: "업종 전체" },
      ...set.map((s) => ({ value: s, label: s })),
    ];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = rows.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !r.symbol.toLowerCase().includes(q))
        return false;
      if (sector !== "전체" && r.sector !== sector) return false;
      // market(KOSPI/KOSDAQ)은 ScoreRow 계약에 아직 없음 → 필드가 있으면 필터, 없으면 전체.
      if (market !== "전체") {
        const rowMarket = (r as ScoreRow & { market?: string }).market;
        if (rowMarket && rowMarket !== market) return false;
      }
      return true;
    });
    return applySort(result);
  }, [rows, query, sector, market, applySort]);

  const head = (key: ScoreSortKey, label: string, align: "left" | "right" | "center") => (
    <TableHead
      aria-sort={
        sort.key === key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"
      }
      className={cn(
        align === "right" && "text-right",
        align === "center" && "text-center",
      )}
    >
      <button
        type="button"
        onClick={() => toggleSort(key)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
          align === "right" && "flex-row-reverse",
          sort.key === key ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <SortIcon active={sort.key === key} dir={sort.dir} />
      </button>
    </TableHead>
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          placeholder="종목명 · 코드 검색"
          containerClassName="w-72"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown label="업종" options={sectorOptions} value={sector} onChange={setSector} />
          <Dropdown
            label="정렬"
            options={SORT_OPTIONS}
            value={sort.key ?? "final_score"}
            onChange={(v) => {
              if (v !== sort.key) toggleSort(v as ScoreSortKey);
            }}
          />
          <Segmented options={MARKETS} value={market} onChange={setMarket} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-card p-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">순위</TableHead>
              {head("name", "종목", "left")}
              <TableHead>업종</TableHead>
              {head("final_score", "최종점수", "center")}
              {head("undervaluation_score", "저평가", "right")}
              {head("investor_flow_score", "수급", "right")}
              {head("volume_spike_score", "거래량", "right")}
              {head("momentum_score", "모멘텀", "right")}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
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
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  조건에 맞는 종목이 없습니다
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
