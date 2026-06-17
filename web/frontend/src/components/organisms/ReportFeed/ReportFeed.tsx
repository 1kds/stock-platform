"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ReportCard } from "@/components/molecules/ReportCard";
import { ReportDetail } from "@/components/organisms/ReportDetail";
import type { ReportFeedProps } from "./ReportFeed.types";

/**
 * 일일 분석 리포트 피드 — 추천 이력을 날짜별 카드로 쌓는다(최신 강조).
 * 카드를 누르면 그날 추천 종목별 분석이 펼쳐진다(아코디언, 한 번에 하나).
 * 기본으로 최신 카드를 펼쳐 둔다.
 */
export function ReportFeed({ rows, detail, className }: ReportFeedProps) {
  const [openDate, setOpenDate] = useState<string | null>(rows[0]?.date ?? null);

  return (
    <div className={cn("flex w-full flex-col gap-3 sm:gap-4", className)}>
      {rows.map((r, i) => (
        <ReportCard
          key={r.date}
          featured={i === 0}
          date={r.date}
          title={`${r.date} Top 3 추천`}
          stocks={r.top3.map((t) => t.name).join(" · ")}
          hit={r.hit}
          ret={r.avg_return_t5}
          expanded={openDate === r.date}
          onToggle={() => setOpenDate(openDate === r.date ? null : r.date)}
        >
          <ReportDetail
            stocks={r.top3}
            detail={detail?.date === r.date ? detail.top3 : undefined}
            day={{ avg_return_t5: r.avg_return_t5, hit: r.hit }}
          />
        </ReportCard>
      ))}
    </div>
  );
}
