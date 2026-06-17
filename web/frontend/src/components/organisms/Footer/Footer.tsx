import Link from "next/link";
import { cn } from "@/lib/utils";
import type { FooterProps } from "./Footer.types";

const PAGE_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/scores", label: "Scores" },
  { href: "/backtest", label: "Backtest" },
  { href: "/tracking", label: "Tracking" },
];

const INFO_LINKS = [
  { href: "/about", label: "About" },
  { href: "/report", label: "Report" },
];

/** 사이트 하단 푸터 — 전용 다크 배경, 전체 폭(사이드바까지). 매우 작은 영문. */
export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("bg-footer text-footer-foreground", className)}>
      <div className="mx-auto max-w-screen-xl px-4 py-4 text-[11px] leading-relaxed sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <span className="text-xs font-semibold text-background">8team Stock Analysis</span>
            <p className="mt-2">
              A distributed stock-analysis platform on Hadoop and Kubernetes. Collects and analyzes
              all KOSPI / KOSDAQ stocks after market close and serves next-day Top 3 picks.
            </p>
          </div>
          <div className="flex gap-12">
            <nav className="flex flex-col gap-1.5">
              <span className="font-semibold text-background">Pages</span>
              {PAGE_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="transition-colors hover:text-background">
                  {l.label}
                </Link>
              ))}
            </nav>
            <nav className="flex flex-col gap-1.5">
              <span className="font-semibold text-background">Info</span>
              {INFO_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="transition-colors hover:text-background">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1 border-t border-footer-foreground/20 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Team 8, Distributed Systems · Updated daily at 08:00 KST</span>
          <span>For reference only — not investment advice.</span>
        </div>
      </div>
    </footer>
  );
}
