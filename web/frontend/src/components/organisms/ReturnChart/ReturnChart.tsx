"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, Cell, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import type { ReturnChartProps } from "./ReturnChart.types";

/** 수익률 막대 차트(Recharts). 양수=상승색(up), 음수=하락색(down). */
export function ReturnChart({
  data,
  title = "최근 30일 성과",
  subtitle = "Top3 평균 일간 수익률 (%)",
  className,
}: ReturnChartProps) {
  return (
    <div className={cn("rounded-md border border-border bg-card p-5", className)}>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-4 h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <XAxis dataKey="date" hide />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--border)",
                fontSize: 12,
              }}
            />
            <Bar dataKey="return" radius={[3, 3, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.return >= 0 ? "var(--up)" : "var(--down)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
