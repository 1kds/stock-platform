import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Topbar } from "@/components/organisms/Topbar";
import { Sidebar } from "@/components/organisms/Sidebar";
import { Footer } from "@/components/organisms/Footer";

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

/** 앱 셸: 풀폭 상단바 + 흰 사이드바 + 밝은 캔버스 콘텐츠. */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <Topbar />
        <div className="flex flex-1">
          {/* 데스크톱(lg:)만 고정 사이드바. 모바일은 Topbar 햄버거 → 오프캔버스 드로어. */}
          <Sidebar className="hidden lg:block" />
          <main className="min-w-0 flex-1">
            <div className="mx-auto max-w-screen-xl p-4 sm:p-6">{children}</div>
          </main>
        </div>
        {/* 전체 폭 푸터 — 사이드바 포함 맨 아래 한 줄. */}
        <Footer />
      </body>
    </html>
  );
}
