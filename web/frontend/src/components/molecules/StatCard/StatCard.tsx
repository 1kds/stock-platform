import { cn } from "@/lib/utils";
import { TrendChip } from "@/components/atoms/TrendChip";
import type { StatCardProps } from "./StatCard.types";

/** KPI 지표 카드. 색은 데이터(수익률 부호)에만 — 기본은 모노톤. */
export function StatCard({
  label,
  value,
  trend,
  sub,
  valueTone = "default",
  icon: Icon,
  className,
}: StatCardProps) {
  const tone =
    valueTone === "up"
      ? "text-up"
      : valueTone === "down"
        ? "text-down"
        : "text-foreground";
  return (
    <div className={cn("rounded-md border border-border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
            <Icon className="size-4" aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className={cn("text-2xl font-bold tabular-nums", tone)}>{value}</span>
            {trend !== undefined && <TrendChip value={trend} />}
          </div>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
      </div>
    </div>
  );
}
