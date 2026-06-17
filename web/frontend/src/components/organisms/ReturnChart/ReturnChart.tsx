"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, Cell, Tooltip } from "recharts";
import { Activity } from "lucide-react";
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
    <section className={cn("flex flex-col rounded-md border border-border bg-card shadow-sm", className)}>
      <div className="border-b border-border px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Activity className="size-4 text-muted-foreground" aria-hidden />
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="h-56 w-full p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <XAxis dataKey="date" hide />
            <Tooltip
              // 마우스를 따라다니지 않고 차트 상단에 고정(세로 0). 가로만 해당 막대에 맞춤.
              position={{ y: 0 }}
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
    </section>
  );
}
