"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { cn, signedPercent } from "@/lib/utils";
import { StatCard } from "@/components/molecules/StatCard";
import type { BacktestResultProps } from "./BacktestResult.types";

/** 백테스팅 결과 — KPI + 기간별 수익률(Top3 vs 시장) 차트. */
export function BacktestResult({ data, className }: BacktestResultProps) {
  const t5 = data.returns_by_horizon.find((h) => h.horizon === "T+5");
  const excess = t5?.excess ?? data.returns_by_horizon.at(-1)?.excess ?? 0;
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="평균 수익률"
          value={signedPercent(data.summary.avg_return)}
          valueTone={
            data.summary.avg_return > 0 ? "up" : data.summary.avg_return < 0 ? "down" : "default"
          }
        />
        <StatCard label="승률" value={`${data.summary.win_rate}%`} />
        <StatCard
          label="최대 낙폭"
          value={signedPercent(data.summary.max_drawdown)}
          valueTone={
            data.summary.max_drawdown > 0 ? "up" : data.summary.max_drawdown < 0 ? "down" : "default"
          }
        />
        <StatCard
          label="초과수익률 (vs 시장)"
          value={`${excess > 0 ? "+" : ""}${excess.toFixed(1)}%p`}
          valueTone={excess > 0 ? "up" : excess < 0 ? "down" : "default"}
        />
      </div>
      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="text-base font-bold text-foreground">기간별 수익률</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Top3 vs 시장 (%)</p>
        <div className="mt-4 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.returns_by_horizon} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="horizon"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                // 마우스를 따라다니지 않고 차트 상단에 고정(세로 0). 가로는 해당 막대에 맞춤.
                position={{ y: 0 }}
                cursor={{ fill: "var(--muted)" }}
                contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="top3_return" name="Top3" fill="var(--accent)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="market_return" name="시장" fill="var(--brand-sage)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
