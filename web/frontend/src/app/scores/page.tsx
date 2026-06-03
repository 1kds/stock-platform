"use client";

import { useEffect, useState } from "react";
import { getScores, type ScoresResponse } from "@/lib/api";
import { ScoresTable } from "@/components/organisms/ScoresTable";
import { LoadingState, ErrorState } from "@/components/organisms/StateViews";

export default function ScoresPage() {
  const [data, setData] = useState<ScoresResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getScores().then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState />;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">전체 종목 점수</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          분석 기준일 {data.date} · {data.count}개 종목 · 7개 지표 종합 점수
        </p>
      </div>
      <ScoresTable rows={data.scores} />
    </div>
  );
}
