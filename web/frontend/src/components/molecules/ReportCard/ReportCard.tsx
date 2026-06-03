import { Check, X } from "lucide-react";
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
        "flex w-full flex-col gap-2 rounded-md border bg-card",
        featured ? "border-primary p-5 sm:p-6" : "border-border p-4",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-primary">{date}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            hit ? "bg-accent/10 text-accent" : "bg-down/10 text-down",
          )}
        >
          {hit ? <Check className="size-3.5" /> : <X className="size-3.5" />}
          {hit ? "적중" : "미적중"}
        </span>
      </div>
      <p className={cn("font-semibold text-foreground", featured && "text-lg")}>{title}</p>
      <p className="text-xs text-muted-foreground">{stocks}</p>
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        평균 수익률 <TrendChip value={ret} />
      </div>
    </div>
  );
}
