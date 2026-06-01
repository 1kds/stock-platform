"use client";

import { useEffect, useState } from "react";
import { getBacktest, type BacktestResponse } from "@/lib/api";
import { BacktestForm } from "@/components/organisms/BacktestForm";
import { BacktestResult } from "@/components/organisms/BacktestResult";
import { LoadingState, ErrorState } from "@/components/organisms/StateViews";

export default function BacktestPage() {
  const [data, setData] = useState<BacktestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBacktest("2026-01-01", "2026-05-29", 5)
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">백테스팅</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          과거 데이터로 추천 전략의 수익률과 승률을 검증합니다
        </p>
      </div>
      <BacktestForm />
      {error && <ErrorState message={error} />}
      {!data && !error && <LoadingState />}
      {data && <BacktestResult data={data} />}
    </div>
  );
}
