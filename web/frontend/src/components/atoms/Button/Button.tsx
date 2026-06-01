import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonProps } from "./Button.types";

// 토큰만 사용 (하드코딩 색 금지). primary=petrol, accent=green.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "border border-border bg-card text-primary hover:bg-muted/50",
        ghost: "text-accent hover:bg-accent/10",
      },
      size: {
        default: "px-4 py-2.5 text-sm",
        sm: "px-3 py-2 text-xs",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

/** 기본 버튼 atom. w-full 미적용 — 너비는 부모가 제어. */
export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
