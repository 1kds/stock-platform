import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { LayoutDashboard, LineChart, History } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "8팀 주식 분석 플랫폼",
  description: "Hadoop·Kubernetes 기반 주식 통합 분석 — Top3 추천 대시보드",
};

const navItems = [
  { href: "/", label: "메인 대시보드", icon: LayoutDashboard },
  { href: "/backtest", label: "백테스팅", icon: LineChart },
  { href: "/tracking", label: "트래킹", icon: History },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {/* 네비게이션 바 */}
        <header className="flex h-14 items-center justify-between border-b px-6">
          <span className="font-semibold">📈 8팀 주식 분석 플랫폼</span>
          <span className="text-sm text-muted-foreground">
            매일 08:00 업데이트
          </span>
        </header>

        <div className="flex">
          {/* 사이드바 */}
          <aside className="h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r p-3">
            <nav className="flex flex-col gap-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* 본문 */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
