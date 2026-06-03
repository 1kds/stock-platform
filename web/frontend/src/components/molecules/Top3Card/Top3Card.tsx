import { cn } from "@/lib/utils";
import { ScoreBadge } from "@/components/atoms/ScoreBadge";
import { Tag } from "@/components/atoms/Tag";
import type { Top3CardProps } from "./Top3Card.types";

const MAX = {
  undervaluation: 25,
  investor_flow: 20,
  volume_spike: 15,
  news_keyword: 10,
  momentum: 20,
  earnings: 10,
} as const;
const LABEL: Record<keyof typeof MAX, string> = {
  undervaluation: "저평가",
  investor_flow: "수급",
  volume_spike: "거래량",
  news_keyword: "뉴스",
  momentum: "모멘텀",
  earnings: "실적",
};

/** Top3 추천 카드(슬림). 클릭 시 onClick → 상세 모달. 강점 태그는 점수 데이터로 산출. */
export function Top3Card({ item, rankAccent = false, onClick, className }: Top3CardProps) {
  const keys = Object.keys(MAX) as (keyof typeof MAX)[];
  const strongest = keys.reduce((a, b) =>
    item.scores[b] / MAX[b] > item.scores[a] / MAX[a] ? b : a,
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
      <Tag className="self-start">{LABEL[strongest]} 우위</Tag>
      <p className="text-sm text-muted-foreground">{item.reason}</p>
    </button>
  );
}
