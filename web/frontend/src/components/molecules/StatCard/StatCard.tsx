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
  className,
}: StatCardProps) {
  const tone =
    valueTone === "up"
      ? "text-up"
      : valueTone === "down"
        ? "text-down"
        : "text-foreground";
  return (
    <div className={cn("rounded-md border border-border bg-card p-4", className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <span className={cn("text-2xl font-bold tabular-nums", tone)}>{value}</span>
        {trend !== undefined && <TrendChip value={trend} />}
      </div>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
