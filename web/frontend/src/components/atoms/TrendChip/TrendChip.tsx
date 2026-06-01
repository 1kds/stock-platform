import { cn } from "@/lib/utils";
import type { TrendChipProps } from "./TrendChip.types";

// 한국 증시 관례: 상승=빨강(up), 하락=파랑(down). green은 등락에 쓰지 않음.
export function TrendChip({ value, className }: TrendChipProps) {
  const flat = value === 0;
  const up = value > 0;
  const tone = flat
    ? "bg-muted text-flat"
    : up
      ? "bg-up/10 text-up"
      : "bg-down/10 text-down";
  const arrow = flat ? "·" : up ? "▲" : "▼";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
        tone,
        className,
      )}
    >
      {arrow} {Math.abs(value).toFixed(1)}%
    </span>
  );
}
