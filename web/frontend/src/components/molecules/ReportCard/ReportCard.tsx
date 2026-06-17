import { Check, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrendChip } from "@/components/atoms/TrendChip";
import type { ReportCardProps } from "./ReportCard.types";

/** 일일 리포트 카드(피드). featured = 최신(petrol 보더). onToggle 지정 시 펼침/접힘 가능. */
export function ReportCard({
  date,
  title,
  stocks,
  hit,
  ret,
  featured = false,
  onToggle,
  expanded = false,
  children,
  className,
}: ReportCardProps) {
  const pad = featured ? "p-5 sm:p-6" : "p-4";
  const interactive = !!onToggle;

  const header = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-primary">{date}</span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              hit ? "bg-accent/10 text-accent" : "bg-down/10 text-down",
            )}
          >
            {hit ? <Check className="size-3.5" /> : <X className="size-3.5" />}
            {hit ? "적중" : "미적중"}
          </span>
          {interactive && (
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                expanded && "rotate-180",
              )}
            />
          )}
        </div>
      </div>
      <p className={cn("font-semibold text-foreground", featured && "text-lg")}>{title}</p>
      <p className="text-xs text-muted-foreground">{stocks}</p>
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        평균 수익률 <TrendChip value={ret} />
      </div>
    </>
  );

  return (
    <div
      className={cn(
        "flex w-full flex-col rounded-md border bg-card",
        featured ? "border-primary" : "border-border",
        className,
      )}
    >
      {interactive ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className={cn(
            "flex w-full flex-col gap-2 rounded-md text-left transition-colors hover:bg-muted/30",
            pad,
          )}
        >
          {header}
        </button>
      ) : (
        <div className={cn("flex w-full flex-col gap-2", pad)}>{header}</div>
      )}

      {interactive && expanded && children && (
        <div className={cn(featured ? "px-5 pb-5 sm:px-6 sm:pb-6" : "px-4 pb-4")}>{children}</div>
      )}
    </div>
  );
}
