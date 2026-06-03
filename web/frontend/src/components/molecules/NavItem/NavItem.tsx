import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NavItemProps } from "./NavItem.types";

/** 흰색 사이드바 네비 항목. 활성 = 옅은 그린 + 좌측 2px 그린 인디케이터 + petrol 굵게. */
export function NavItem({ href, label, icon: Icon, active = false, className }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md border-l-2 px-3 py-2 text-sm transition-colors",
        active
          ? "border-accent bg-accent/10 font-medium text-primary"
          : "border-transparent text-muted-foreground hover:bg-muted",
        className,
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
