import { cn } from "@/lib/utils";
import type { TagProps } from "./Tag.types";

/** 작은 라벨 태그. 강조(green)는 틀/메타용 — 등락 의미엔 TrendChip 사용. */
export function Tag({ children, tone = "green", className }: TagProps) {
  const t =
    tone === "green"
      ? "bg-accent/10 text-accent"
      : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        t,
        className,
      )}
    >
      {children}
    </span>
  );
}
