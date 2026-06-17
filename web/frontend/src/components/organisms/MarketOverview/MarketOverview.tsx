import { cn } from "@/lib/utils";
import type { MarketOverviewProps } from "./MarketOverview.types";

/** 점수 등급 분포 바/범례 메타 (score 토큰 재사용). */
const TIERS = [
  { key: "high", label: "고득점", bar: "bg-score-high" },
  { key: "mid", label: "중간", bar: "bg-score-mid" },
  { key: "low", label: "저득점", bar: "bg-score-low" },
] as const;

/** 작은 인라인 통계 (카드 안 카드 방지 — 전용 경량 블록). */
function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold text-foreground">
        {value}
        {sub && <span className="ml-1 text-xs font-normal text-muted-foreground">{sub}</span>}
      </p>
    </div>
  );
}

/** 오늘 분석 전체 요약 띠 — 종목 수·시장 구성·평균 점수·등급 분포. */
export function MarketOverview({ summary, className }: MarketOverviewProps) {
  const { total, byMarket, avgScore, tiers } = summary;
  const pct = (n: number) => (total ? (n / total) * 100 : 0);

  return (
    <section
      aria-label="오늘 분석 전체 요약"
      className={cn("rounded-md border border-border bg-card p-4 shadow-sm", className)}
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <Stat label="분석 종목" value={`${total}종목`} />
        <Stat label="시장" value={`KOSPI ${byMarket.kospi} · KOSDAQ ${byMarket.kosdaq}`} />
        <Stat label="평균 점수" value={String(avgScore)} sub="/ 100" />
      </div>

      <div className="mt-4">
        <div className="flex h-2.5 overflow-hidden rounded-full bg-muted" role="img" aria-label="점수 등급 분포">
          {TIERS.map((t) =>
            tiers[t.key] > 0 ? (
              <div key={t.key} className={t.bar} style={{ width: `${pct(tiers[t.key])}%` }} />
            ) : null,
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {TIERS.map((t) => (
            <span key={t.key} className="inline-flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", t.bar)} aria-hidden />
              {t.label} {tiers[t.key]}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
