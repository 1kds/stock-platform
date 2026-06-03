import { cn } from "@/lib/utils";
import type { StatusDotProps } from "./StatusDot.types";

/** 상태명 (색만으로 상태를 전달하지 않도록 스크린리더용 텍스트로 보완). */
const TONE_NAME: Record<NonNullable<StatusDotProps["tone"]>, string> = {
  ok: "정상",
  warn: "경고",
  down: "하락",
};

/** 상태 점 (+ 선택 라벨). 정상=green, 경고=red(up), 하락=blue(down). */
export function StatusDot({ tone = "ok", label, className }: StatusDotProps) {
  const c = tone === "ok" ? "bg-accent" : tone === "down" ? "bg-down" : "bg-up";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("size-2 rounded-full", c)} role="img" aria-label={TONE_NAME[tone]} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </span>
  );
}
