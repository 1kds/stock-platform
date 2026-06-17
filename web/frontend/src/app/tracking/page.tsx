"use client";

import { useEffect, useState } from "react";
import { Target, TrendingUp, CalendarRange } from "lucide-react";
import { getTracking, type TrackingResponse } from "@/lib/api";
import { signedPercent } from "@/lib/utils";
import type { StatCardProps } from "@/components/molecules/StatCard";
import { Segmented } from "@/components/molecules/Segmented";
import { KpiGrid } from "@/components/organisms/KpiGrid";
import {
  TrackingTable,
  filterHistoryByPeriod,
  type TrackingPeriod,
} from "@/components/organisms/TrackingTable";
import { LoadingState, ErrorState } from "@/components/organisms/StateViews";

export default function TrackingPage() {
  const [data, setData] = useState<TrackingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<TrackingPeriod>("최근 1개월");

  useEffect(() => {
    getTracking().then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState />;

  const visible = filterHistoryByPeriod(data.history, period);
  const hitDays = visible.filter((h) => h.hit).length;
  const hitRate = visible.length ? Math.round((hitDays / visible.length) * 1000) / 10 : 0;
  const avgReturn = visible.length
    ? Math.round((visible.reduce((s, h) => s + h.avg_return_t5, 0) / visible.length) * 10) / 10
    : 0;
  const kpi: StatCardProps[] = [
    {
      label: "적중률",
      value: `${hitRate}%`,
      sub: `${hitDays} / ${visible.length} 적중일`,
      icon: Target,
    },
    {
      label: "평균 수익률",
      value: signedPercent(avgReturn),
      valueTone: avgReturn > 0 ? "up" : avgReturn < 0 ? "down" : "default",
      icon: TrendingUp,
    },
    { label: "추적 기간", value: period, sub: "필터 기준", icon: CalendarRange },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">트래킹</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            추천 종목의 실제 수익률과 적중률을 추적합니다
          </p>
        </div>
        <Segmented
          options={["최근 1주", "최근 1개월", "전체"]}
          value={period}
          onChange={(v) => setPeriod(v as TrackingPeriod)}
        />
      </div>
      <KpiGrid items={kpi} />
      <TrackingTable rows={data.history} period={period} />
    </div>
  );
}
