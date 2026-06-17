"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, ListOrdered, LineChart, History, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem } from "@/components/molecules/NavItem";
import type { SidebarProps } from "./Sidebar.types";

const ITEMS = [
  { href: "/", label: "메인 대시보드", icon: LayoutDashboard },
  { href: "/scores", label: "종목 점수", icon: ListOrdered },
  { href: "/backtest", label: "백테스팅", icon: LineChart },
  { href: "/tracking", label: "트래킹", icon: History },
  { href: "/report", label: "리포트", icon: FileText },
];

/**
 * 흰색 사이드바. usePathname으로 활성 메뉴 판정.
 * variant="fixed"(기본): 데스크톱 고정 사이드바 (셸에서 lg: 이상에서만 노출).
 * variant="drawer": 모바일 오프캔버스 드로어 내부에서 사용 (폭은 부모가 제어).
 */
export function Sidebar({ variant = "fixed", onNavigate, className }: SidebarProps) {
  const pathname = usePathname() ?? "/";
  return (
    <aside
      className={cn(
        "border-border bg-card",
        variant === "fixed" ? "w-56 shrink-0 border-r p-3" : "h-full w-full p-3",
        className,
      )}
    >
      <nav className="flex flex-col gap-1">
        {ITEMS.map((it) => (
          <NavItem
            key={it.href}
            {...it}
            active={it.href === "/" ? pathname === "/" : pathname.startsWith(it.href)}
            onClick={onNavigate}
          />
        ))}
      </nav>
    </aside>
  );
}
