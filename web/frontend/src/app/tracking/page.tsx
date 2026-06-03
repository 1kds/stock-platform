"use client";

import { useEffect, useState } from "react";
import { getTracking, type TrackingResponse } from "@/lib/api";
import type { StatCardProps } from "@/components/molecules/StatCard";
import { Segmented } from "@/components/molecules/Segmented";
import { KpiGrid } from "@/components/organisms/KpiGrid";
import { TrackingTable } from "@/components/organisms/TrackingTable";
import { LoadingState, ErrorState } from "@/components/organisms/StateViews";

export default function TrackingPage() {
  const [data, setData] = useState<TrackingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("최근 1개월");

  useEffect(() => {
    getTracking().then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState />;

  const hitDays = data.history.filter((h) => h.hit).length;
  const kpi: StatCardProps[] = [
    {
      label: "적중률",
      value: `${data.summary.hit_rate}%`,
      sub: `${hitDays} / ${data.history.length} 적중일`,
    },
    {
      label: "평균 수익률",
      value: `${data.summary.avg_return > 0 ? "+" : ""}${data.summary.avg_return}%`,
      valueTone: "up",
    },
    { label: "추적 기간", value: period, sub: "필터 기준" },
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
          onChange={setPeriod}
        />
      </div>
      <KpiGrid items={kpi} />
      <TrackingTable rows={data.history} />
    </div>
  );
}
