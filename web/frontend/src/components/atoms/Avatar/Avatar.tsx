import { cn } from "@/lib/utils";
import type { AvatarProps } from "./Avatar.types";

export function Avatar({ initial, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground",
        className,
      )}
    >
      {initial}
    </span>
  );
}
