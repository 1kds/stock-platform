import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchInputProps } from "./SearchInput.types";

export function SearchInput({ containerClassName, className, ...props }: SearchInputProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2",
        containerClassName,
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        type={props.type ?? "search"}
        aria-label={props["aria-label"] ?? props.placeholder ?? "검색"}
        className={cn(
          "w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none",
          className,
        )}
        {...props}
      />
    </div>
  );
}
