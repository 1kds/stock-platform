"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ABOUT_SECTIONS } from "@/components/organisms/AboutSections";
import type { AboutNavProps } from "./AboutNav.types";

/** 소개 페이지 우측 sticky 목차. 클릭 시 해당 섹션으로 이동, 현재 섹션 자동 강조(스크롤 스파이). */
export function AboutNav({ className }: AboutNavProps) {
  const [active, setActive] = useState<string>(ABOUT_SECTIONS[0].id);

  useEffect(() => {
    const els = ABOUT_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      // 상단 1/4 지점에 들어온 섹션을 현재로 — 헤더 높이 보정.
      { rootMargin: "-25% 0px -65% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <aside className={cn("sticky top-20 h-fit w-48 shrink-0", className)}>
      <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground">목차</p>
      <nav className="flex flex-col border-l border-border">
        {ABOUT_SECTIONS.map((s, i) => {
          const on = active === s.id;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={on ? "true" : undefined}
              className={cn(
                "-ml-px flex items-baseline gap-2 border-l-2 py-1.5 pl-3 text-base transition-colors",
                on
                  ? "border-accent font-semibold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="text-sm tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.title}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
