import { cn } from "@/lib/utils";
import type { ScoreBarProps } from "./ScoreBar.types";

/** 점수 항목 막대. width는 비율(인라인 style — 색 아님). */
export function ScoreBar({ label, value, max, penalty = false, className }: ScoreBarProps) {
  const pct = Math.max(4, Math.round((Math.abs(value) / max) * 100));
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="w-14 shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", penalty ? "bg-up" : "bg-accent")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn(
          "w-16 shrink-0 text-right text-xs font-semibold tabular-nums",
          penalty ? "text-up" : "text-primary",
        )}
      >
        {penalty ? "−" : ""}
        {Math.abs(value)} / {max}
      </span>
    </div>
  );
}
