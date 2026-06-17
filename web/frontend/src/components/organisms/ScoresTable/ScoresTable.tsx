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
  { value: "news_keyword_score", label: "뉴스순" },
  { value: "momentum_score", label: "모멘텀순" },
  { value: "earnings_score", label: "실적순" },
  { value: "name", label: "종목명순" },
];

// 보조 점수 칼럼 최대 배점(common.md §5) — 미니 막대 비율 계산용.
const COL_MAX = {
  undervaluation: 25,
  investor_flow: 20,
  volume_spike: 15,
  news_keyword: 10,
  momentum: 20,
  earnings: 10,
} as const;

/**
 * 점수 숫자 + 최대배점 대비 세로 미니 막대(숫자 오른쪽, 아래→위로 차오름).
 * 색은 단일 초록(accent)에 채운 양(%) 비례 투명도(0.35~1.0)를 줘 연속적으로 희미→진하게.
 */
function ScoreCell({ value, max }: { value: number; max: number }) {
  const pct = max ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  // 적게 차면 희미(0.35) → 많이 차면 진함(1.0), 채운 양에 따라 연속 변화.
  const opacity = Math.round((0.35 + (pct / 100) * 0.65) * 100) / 100;
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="tabular-nums text-foreground">{value}</span>
      <span className="flex h-6 w-3.5 items-end overflow-hidden rounded-[2px] bg-muted" aria-hidden>
        <span
          className="block w-full rounded-[2px] bg-accent"
          style={{ height: `${pct}%`, opacity }}
        />
      </span>
    </div>
  );
}

/** 정렬 화살표 아이콘 — 현재 정렬 컬럼/방향 반영. */
function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ChevronsUpDown aria-hidden className="size-3 opacity-40" />;
  return dir === "asc" ? (
    <ArrowUp aria-hidden className="size-3" />
  ) : (
    <ArrowDown aria-hidden className="size-3" />
  );
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
      news_keyword_score: (r) => r.news_keyword_score,
      momentum_score: (r) => r.momentum_score,
      earnings_score: (r) => r.earnings_score,
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
            onChange={(v) => toggleSort(v as ScoreSortKey)}
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
              {head("news_keyword_score", "뉴스", "right")}
              {head("momentum_score", "모멘텀", "right")}
              {head("earnings_score", "실적", "right")}
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
                <TableCell><ScoreCell value={r.undervaluation_score} max={COL_MAX.undervaluation} /></TableCell>
                <TableCell><ScoreCell value={r.investor_flow_score} max={COL_MAX.investor_flow} /></TableCell>
                <TableCell><ScoreCell value={r.volume_spike_score} max={COL_MAX.volume_spike} /></TableCell>
                <TableCell><ScoreCell value={r.news_keyword_score} max={COL_MAX.news_keyword} /></TableCell>
                <TableCell><ScoreCell value={r.momentum_score} max={COL_MAX.momentum} /></TableCell>
                <TableCell><ScoreCell value={r.earnings_score} max={COL_MAX.earnings} /></TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center text-sm text-muted-foreground">
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
