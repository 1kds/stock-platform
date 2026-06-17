import { cn } from "@/lib/utils";
import { scoreBadgeLevel } from "@/lib/scores";
import type { ScoreBadgeProps } from "./ScoreBadge.types";

// 점수 4단계 → 토큰 색 (DESIGN.md 점수 등급색). 하드코딩 금지, 토큰 클래스만 사용.
// 단계 기준은 lib/scores.ts scoreBadgeLevel() 단일 기준을 따른다.
// strong=petrol / high=green / mid=light / low=중립 회색 → 점수 대비를 시각화.
const LEVEL_CLASS = {
  strong: "bg-brand-petrol text-primary-foreground",
  high: "bg-score-high text-primary-foreground",
  mid: "bg-score-mid text-primary",
  low: "bg-score-faint text-muted-foreground",
} as const;

/** 점수를 등급색 뱃지로 표시하는 atom. 너비 고정 없음(내용에 맞춤). */
export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums",
        LEVEL_CLASS[scoreBadgeLevel(score)],
        className,
      )}
    >
      {score}
    </span>
  );
}
