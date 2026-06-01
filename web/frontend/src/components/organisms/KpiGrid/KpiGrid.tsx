import { cn } from "@/lib/utils";
import { StatCard } from "@/components/molecules/StatCard";
import type { KpiGridProps } from "./KpiGrid.types";

/** KPI 카드 그리드 (반응형). items는 페이지가 데이터로 구성. */
export function KpiGrid({ items, className }: KpiGridProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((it, i) => (
        <StatCard key={i} {...it} />
      ))}
    </div>
  );
}
