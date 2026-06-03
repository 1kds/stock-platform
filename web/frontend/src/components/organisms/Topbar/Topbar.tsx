"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Clock, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/atoms/LogoMark";
import { Avatar } from "@/components/atoms/Avatar";
import { Sidebar } from "@/components/organisms/Sidebar";
import type { TopbarProps } from "./Topbar.types";

const LINKS = [
  { href: "/", label: "홈" },
  { href: "/about", label: "소개" },
  { href: "/report", label: "리포트" },
];

/**
 * 풀폭 상단바: 좌 로고 · 중앙 링크 · 우 업데이트/아바타.
 * 모바일(<lg): 좌측에 햄버거 → 오프캔버스 드로어(사이드바). 중앙 링크는 숨기고 우측 요소 응축.
 */
export function Topbar({ className }: TopbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between gap-2 border-b border-border bg-card px-4 lg:grid lg:grid-cols-3 lg:px-6",
        className,
      )}
    >
      {/* 좌: 햄버거(모바일) + 로고 */}
      <div className="flex min-w-0 items-center gap-2 lg:justify-self-start">
        <DialogPrimitive.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DialogPrimitive.Trigger
            aria-label="메뉴 열기"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          >
            <Menu className="size-5" />
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/30 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 lg:hidden" />
            <DialogPrimitive.Popup className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80%] flex-col bg-card shadow-lg outline-none duration-150 data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left lg:hidden">
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
                <Link
                  href="/"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-2"
                >
                  <LogoMark />
                  <span className="text-sm font-semibold text-foreground">
                    8team 주식 분석
                  </span>
                </Link>
                <DialogPrimitive.Close
                  aria-label="메뉴 닫기"
                  className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-5" />
                </DialogPrimitive.Close>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <Sidebar variant="drawer" onNavigate={() => setDrawerOpen(false)} />
              </div>
              {/* 모바일 드로어 안에 상단 중앙 링크도 노출 */}
              <nav className="flex flex-col gap-1 border-t border-border p-3">
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </DialogPrimitive.Popup>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>

        <Link href="/" className="flex min-w-0 items-center gap-2">
          <LogoMark />
          <span className="truncate text-sm font-semibold text-foreground">
            8team 주식 분석
          </span>
        </Link>
      </div>

      {/* 중앙: 링크(데스크톱만) */}
      <nav className="hidden items-center gap-5 lg:flex lg:justify-self-center">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {/* 우: 업데이트 라벨(모바일은 숨김) + 아바타 */}
      <div className="flex shrink-0 items-center gap-3 lg:justify-self-end">
        <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <Clock className="size-3.5" />
          08:00 업데이트
        </span>
        <span className="hidden h-5 w-px bg-border sm:block" />
        <Avatar initial="조" />
      </div>
    </header>
  );
}
