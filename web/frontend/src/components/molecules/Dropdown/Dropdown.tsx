import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DropdownProps } from "./Dropdown.types";

/** 표시용 드롭다운 트리거(목업). 실제 메뉴는 추후. */
export function Dropdown({ label, className }: DropdownProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted",
        className,
      )}
    >
      {label}
      <ChevronDown className="size-3.5" />
    </button>
  );
}
