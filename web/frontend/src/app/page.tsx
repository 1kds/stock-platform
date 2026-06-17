"use client";

import { useEffect, useState } from "react";
import { Target, TrendingUp, Trophy, Clock } from "lucide-react";
import {
  getScores,
  getTop3,
  getTracking,
  type ScoresResponse,
  type Top3Response,
  type TrackingResponse,
  type Top3Item,
} from "@/lib/api";
import { signedPercent } from "@/lib/utils";
import { summarizeScores, sectorDistribution } from "@/lib/marketSummary";
import type { StatCardProps } from "@/components/molecules/StatCard";
import { MarketOverview } from "@/components/organisms/MarketOverview";
import { KpiGrid } from "@/components/organisms/KpiGrid";
import { Top3Grid } from "@/components/organisms/Top3Grid";
import { Watchlist } from "@/components/organisms/Watchlist";
import { SectorDistribution } from "@/components/organisms/SectorDistribution";
import { ReturnChart } from "@/components/organisms/ReturnChart";
import { HistoryTable } from "@/components/organisms/HistoryTable";
import { StockDetailModal } from "@/components/organisms/StockDetailModal";
import { LoadingState, ErrorState } from "@/components/organisms/StateViews";

export default function DashboardPage() {
  const [top3, setTop3] = useState<Top3Response | null>(null);
  const [tracking, setTracking] = useState<TrackingResponse | null>(null);
  const [scores, setScores] = useState<ScoresResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Top3Item | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getTop3().then(setTop3).catch((e) => setError(String(e)));
    getTracking().then(setTracking).catch(() => {});
    getScores().then(setScores).catch(() => {});
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!top3) return <LoadingState />;

  const kpi: StatCardProps[] = tracking
    ? [
        { label: "적중률", value: `${tracking.summary.hit_rate}%`, sub: "최근 추천 기준", icon: Target },
        {
          label: "평균 수익률",
          value: signedPercent(tracking.summary.avg_return),
          valueTone:
            tracking.summary.avg_return > 0
              ? "up"
              : tracking.summary.avg_return < 0
                ? "down"
                : "default",
          sub: "추천 종목 평균",
          icon: TrendingUp,
        },
        { label: "추천 종목", value: String(top3.top3.length), sub: "오늘 Top3", icon: Trophy },
        {
          label: "마지막 업데이트",
          value: top3.updated_at.split(" ")[1] ?? top3.updated_at,
          sub: top3.date,
          icon: Clock,
        },
      ]
    : [];

  const summary = scores ? summarizeScores(scores.scores) : null;
  const sectors = scores ? sectorDistribution(scores.scores) : [];
  const watchlistRows = scores
    ? scores.scores.filter((r) => r.rank >= 4 && r.rank <= 10).sort((a, b) => a.rank - b.rank)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">오늘의 Top 3 추천 종목</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          분석 기준일 {top3.date} · 업데이트 {top3.updated_at}
        </p>
      </div>

      <Top3Grid
        items={top3.top3}
        onSelect={(it) => {
          setSelected(it);
          setOpen(true);
        }}
      />

      {summary && <MarketOverview summary={summary} />}

      {tracking && <KpiGrid items={kpi} />}

      {scores && (
        <div className="grid items-start gap-4 lg:grid-cols-3">
          <Watchlist rows={watchlistRows} className="lg:col-span-2" />
          <SectorDistribution data={sectors} />
        </div>
      )}

      {tracking && (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <ReturnChart data={tracking.return_chart} />
          <HistoryTable rows={tracking.history} />
        </div>
      )}

      <StockDetailModal item={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
