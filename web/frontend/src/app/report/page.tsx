"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { getTracking, getTop3, type TrackingResponse, type Top3Response } from "@/lib/api";
import { SearchInput } from "@/components/molecules/SearchInput";
import { ReportFeed } from "@/components/organisms/ReportFeed";
import { LoadingState, ErrorState } from "@/components/organisms/StateViews";

export default function ReportPage() {
  const [data, setData] = useState<TrackingResponse | null>(null);
  const [top3, setTop3] = useState<Top3Response | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTracking().then(setData).catch((e) => setError(String(e)));
    getTop3().then(setTop3).catch(() => {});
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 sm:gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">일일 분석 리포트</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            매일 08:00 자동 생성 · 리포트를 누르면 그날 추천 종목별 점수 분석이 펼쳐집니다
          </p>
        </div>
        {/* 날짜·종목 검색 (UI만 — 동작 미연결) */}
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            icon={Calendar}
            placeholder="날짜 검색"
            aria-label="날짜 검색"
            containerClassName="w-40"
          />
          <SearchInput placeholder="종목 검색" aria-label="종목 검색" containerClassName="w-44" />
        </div>
      </div>
      {error && <ErrorState message={error} />}
      {!data && !error && <LoadingState />}
      {data && <ReportFeed rows={data.history} detail={top3} />}
    </div>
  );
}
