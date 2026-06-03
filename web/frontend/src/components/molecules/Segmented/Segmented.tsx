import { cn } from "@/lib/utils";
import type { SegmentedProps } from "./Segmented.types";

/** 세그먼트 컨트롤. onChange 전달 시 상위(클라이언트)에서 상태 제어. */
export function Segmented({ options, value, onChange, className }: SegmentedProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-card p-1",
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={onChange ? () => onChange(o) : undefined}
          className={cn(
            "rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors",
            o === value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
