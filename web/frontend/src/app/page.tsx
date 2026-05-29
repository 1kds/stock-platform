"use client";

import { useEffect, useState } from "react";
import { Top3Card } from "@/components/Top3Card";
import { getTop3, type Top3Response } from "@/lib/api";

export default function DashboardPage() {
  const [data, setData] = useState<Top3Response | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTop3()
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">오늘의 Top 3 추천 종목</h1>
        {data && (
          <p className="text-sm text-muted-foreground">
            분석 기준일 {data.date} · 업데이트 {data.updated_at}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">
          백엔드 연결 실패: {error}
          <br />
          <span className="text-muted-foreground">
            FastAPI 서버를 켜주세요 → web/backend 에서 uvicorn main:app --port 8000
          </span>
        </div>
      )}

      {!data && !error && (
        <p className="text-sm text-muted-foreground">불러오는 중…</p>
      )}

      {data && (
        <div className="grid gap-4 md:grid-cols-3">
          {data.top3.map((item) => (
            <Top3Card key={item.symbol} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
