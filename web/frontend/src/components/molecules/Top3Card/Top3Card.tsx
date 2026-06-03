import { cn } from "@/lib/utils";
import { SCORE_ITEMS } from "@/lib/scores";
import { ScoreBadge } from "@/components/atoms/ScoreBadge";
import { Tag } from "@/components/atoms/Tag";
import type { Top3CardProps } from "./Top3Card.types";

/** Top3 추천 카드(슬림). 클릭 시 onClick → 상세 모달. 강점 태그는 점수 데이터로 산출. */
export function Top3Card({ item, rankAccent = false, onClick, className }: Top3CardProps) {
  const strongest = SCORE_ITEMS.reduce((a, b) =>
    item.scores[b.key] / b.max > item.scores[a.key] / a.max ? b : a,
  );
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
      <Tag className="self-start">{strongest.label} 우위</Tag>
      <p className="text-sm text-muted-foreground">{item.reason}</p>
    </button>
  );
}
