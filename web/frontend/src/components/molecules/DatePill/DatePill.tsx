import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DatePillProps } from "./DatePill.types";

export function DatePill({ date, className }: DatePillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-sm font-medium text-primary",
        className,
      )}
    >
      <Calendar className="size-4 text-muted-foreground" />
      {date}
    </span>
  );
}
