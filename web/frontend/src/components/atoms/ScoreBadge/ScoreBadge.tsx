import { cn } from "@/lib/utils";
import { scoreTier } from "@/lib/scores";
import type { ScoreBadgeProps } from "./ScoreBadge.types";

// 점수 등급 → 토큰 색 (DESIGN.md 점수 등급색). 하드코딩 금지, score 토큰만 사용.
// 임계값은 lib/scores.ts scoreTier() 단일 기준을 따른다.
function tierClass(score: number): string {
  const tier = scoreTier(score);
  if (tier === "high") return "bg-score-high text-primary-foreground";
  if (tier === "mid") return "bg-score-mid text-primary";
  return "bg-score-low text-primary";
}

/** 점수를 등급색 뱃지로 표시하는 atom. 너비 고정 없음(내용에 맞춤). */
export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums",
        tierClass(score),
        className,
      )}
    >
      {score}
    </span>
  );
}
