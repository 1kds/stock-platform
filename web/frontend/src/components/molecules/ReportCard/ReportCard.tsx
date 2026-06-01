import { cn } from "@/lib/utils";
import { TrendChip } from "@/components/atoms/TrendChip";
import type { ReportCardProps } from "./ReportCard.types";

/** 일일 리포트 카드(피드). featured = 최신(petrol 보더). */
export function ReportCard({
  date,
  title,
  stocks,
  hit,
  ret,
  featured = false,
  className,
}: ReportCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md border bg-card p-4",
        featured ? "border-primary" : "border-border",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-primary">{date}</span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
            hit ? "bg-accent/10 text-accent" : "bg-down/10 text-down",
          )}
        >
          {hit ? "✅ 적중" : "❌ 미적중"}
        </span>
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{stocks}</p>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        평균 수익률 <TrendChip value={ret} />
      </div>
    </div>
  );
}
