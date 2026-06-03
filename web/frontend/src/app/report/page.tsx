"use client";

import { useEffect, useState } from "react";
import { getTracking, type TrackingResponse } from "@/lib/api";
import { ReportFeed } from "@/components/organisms/ReportFeed";
import { LoadingState, ErrorState } from "@/components/organisms/StateViews";

export default function ReportPage() {
  const [data, setData] = useState<TrackingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTracking().then(setData).catch((e) => setError(String(e)));
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 sm:gap-5">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">일일 분석 리포트</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          매일 08:00 자동 생성 · 추천 시점 대비 적중 결과 포함
        </p>
      </div>
      {error && <ErrorState message={error} />}
      {!data && !error && <LoadingState />}
      {data && <ReportFeed rows={data.history} />}
    </div>
  );
}
