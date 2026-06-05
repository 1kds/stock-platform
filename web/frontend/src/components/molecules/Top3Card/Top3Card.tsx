import { cn } from "@/lib/utils";
import { topStrengths } from "@/lib/scores";
import { ScoreBadge } from "@/components/atoms/ScoreBadge";
import { Tag } from "@/components/atoms/Tag";
import type { Top3CardProps } from "./Top3Card.types";

/** Top3 추천 카드(슬림). 클릭 시 onClick → 상세 모달. 강점 태그 상위 3개는 점수 데이터로 산출. */
export function Top3Card({ item, rankAccent = false, onClick, className }: Top3CardProps) {
  const strengths = topStrengths(item.scores, 3);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-2.5 rounded-md border bg-card p-4 text-left transition-shadow hover:shadow-sm",
        rankAccent ? "border-primary" : "border-border",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {item.rank}
          </span>
          <div>
            <p className="font-bold text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.symbol}</p>
          </div>
        </div>
        <ScoreBadge score={item.final_score} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {strengths.map((s, i) => {
          // 강도: 해당 항목 점수 ÷ 최대 배점 → 0~100. 항목별 만점이 달라도 비교 가능.
          const intensity = Math.round((item.scores[s.key] / s.max) * 100);
          return (
            <Tag key={s.key} tone={i === 0 ? "green" : "neutral"}>
              {s.label} <span className="ml-0.5 tabular-nums font-bold">{intensity}</span>
            </Tag>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">{item.reason}</p>
    </button>
  );
}
