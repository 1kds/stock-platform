"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, ListOrdered, LineChart, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem } from "@/components/molecules/NavItem";
import type { SidebarProps } from "./Sidebar.types";

const ITEMS = [
  { href: "/", label: "메인 대시보드", icon: LayoutDashboard },
  { href: "/scores", label: "종목 점수", icon: ListOrdered },
  { href: "/backtest", label: "백테스팅", icon: LineChart },
  { href: "/tracking", label: "트래킹", icon: History },
];

/** 흰색 사이드바. usePathname으로 활성 메뉴 판정. */
export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname() ?? "/";
  return (
    <aside className={cn("w-56 shrink-0 border-r border-border bg-card p-3", className)}>
      <nav className="flex flex-col gap-1">
        {ITEMS.map((it) => (
          <NavItem
            key={it.href}
            {...it}
            active={it.href === "/" ? pathname === "/" : pathname.startsWith(it.href)}
          />
        ))}
      </nav>
    </aside>
  );
}
