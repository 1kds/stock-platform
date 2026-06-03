import Link from "next/link";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/atoms/LogoMark";
import { Avatar } from "@/components/atoms/Avatar";
import type { TopbarProps } from "./Topbar.types";

const LINKS = [
  { href: "/", label: "홈" },
  { href: "/about", label: "소개" },
  { href: "/report", label: "리포트" },
];

/** 풀폭 상단바: 좌 로고 · 중앙 링크 · 우 업데이트/아바타. */
export function Topbar({ className }: TopbarProps) {
  return (
    <header
      className={cn(
        "grid h-14 grid-cols-3 items-center border-b border-border bg-card px-6",
        className,
      )}
    >
      <Link href="/" className="flex items-center gap-2 justify-self-start">
        <LogoMark />
        <span className="text-sm font-semibold text-foreground">8team 주식 분석</span>
      </Link>
      <nav className="flex items-center gap-5 justify-self-center">
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
      <div className="flex items-center gap-3 justify-self-end">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          08:00 업데이트
        </span>
        <span className="h-5 w-px bg-border" />
        <Avatar initial="조" />
      </div>
    </header>
  );
}
