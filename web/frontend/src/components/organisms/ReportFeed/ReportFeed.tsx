import { cn } from "@/lib/utils";
import { ReportCard } from "@/components/molecules/ReportCard";
import type { ReportFeedProps } from "./ReportFeed.types";

/** 일일 분석 리포트 피드 — 추천 이력 데이터에서 파생(최신 featured + 목록). */
export function ReportFeed({ rows, className }: ReportFeedProps) {
  const toCard = (r: ReportFeedProps["rows"][number]) => ({
    date: r.date,
    title: `${r.date} Top 3 추천`,
    stocks: r.top3.map((t) => t.name).join(" · "),
    hit: r.hit,
    ret: r.avg_return_t5,
  });
  const [first, ...rest] = rows;
  return (
    <div className={cn("flex w-full flex-col gap-4 sm:gap-5", className)}>
      {first && <ReportCard featured {...toCard(first)} />}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rest.map((r) => (
            <ReportCard key={r.date} {...toCard(r)} />
          ))}
        </div>
      )}
    </div>
  );
}
