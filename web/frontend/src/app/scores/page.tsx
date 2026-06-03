"use client";

import { useEffect, useState } from "react";
import { getScores, type ScoresResponse } from "@/lib/api";
import { ScoresTable } from "@/components/organisms/ScoresTable";
import { SearchInput } from "@/components/molecules/SearchInput";
import { Dropdown } from "@/components/molecules/Dropdown";
import { Segmented } from "@/components/molecules/Segmented";
import { LoadingState, ErrorState } from "@/components/organisms/StateViews";

export default function ScoresPage() {
  const [data, setData] = useState<ScoresResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [market, setMarket] = useState("전체");

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput placeholder="종목명 · 코드 검색" containerClassName="w-72" />
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown label="업종 전체" />
          <Dropdown label="정렬: 점수 높은순" />
          <Segmented
            options={["전체", "KOSPI", "KOSDAQ"]}
            value={market}
            onChange={setMarket}
          />
        </div>
      </div>
      <ScoresTable rows={data.scores} />
    </div>
  );
}
