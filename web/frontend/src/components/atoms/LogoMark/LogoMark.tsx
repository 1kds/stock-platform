import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LogoMarkProps } from "./LogoMark.types";

/** petrol 라운드 정사각 로고 마크. 워드마크는 Topbar에서 별도. */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground",
        className,
      )}
    >
      <TrendingUp className="size-4" />
    </span>
  );
}
