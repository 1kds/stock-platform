import { cn } from "@/lib/utils";
import type { SectorDistributionProps } from "./SectorDistribution.types";

/** 업종별 종목 수 가로 막대. 막대 폭은 최다 업종 대비 비율(색 아님). */
export function SectorDistribution({ data, className }: SectorDistributionProps) {
  const max = data.reduce((m, d) => Math.max(m, d.count), 0) || 1;
  return (
    <section className={cn("flex flex-col rounded-md border border-border bg-card", className)}>
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold text-foreground">업종 분포</h2>
      </div>
      <ul className="flex flex-col gap-2.5 p-4">
        {data.map((d) => (
          <li key={d.sector} className="flex items-center gap-3">
            <span className="w-16 shrink-0 truncate text-sm text-muted-foreground" title={d.sector}>
              {d.sector}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-accent" style={{ width: `${(d.count / max) * 100}%` }} />
            </div>
            <span className="w-6 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
              {d.count}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
