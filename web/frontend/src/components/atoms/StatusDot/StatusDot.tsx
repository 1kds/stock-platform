import { cn } from "@/lib/utils";
import type { StatusDotProps } from "./StatusDot.types";

/** 상태 점 (+ 선택 라벨). 정상=green, 경고=red(up), 하락=blue(down). */
export function StatusDot({ tone = "ok", label, className }: StatusDotProps) {
  const c = tone === "ok" ? "bg-accent" : tone === "down" ? "bg-down" : "bg-up";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("size-2 rounded-full", c)} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </span>
  );
}
