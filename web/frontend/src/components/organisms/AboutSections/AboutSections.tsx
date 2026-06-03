import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Tag } from "@/components/atoms/Tag";
import type { AboutSectionsProps } from "./AboutSections.types";

const STATS = [
  ["KOSPI·KOSDAQ", "매일 자동 분석 대상"],
  ["7", "종목 평가 지표"],
  ["08:00", "매일 분석 완료·갱신"],
  ["1 + 3", "K8s 노드 (master+worker)"],
];
const PIPELINE = [
  ["20:00~20:40", "데이터 수집", "주가·수급·뉴스·공시 크롤링"],
  ["저장", "HDFS /data", "Parquet · 일자 파티션"],
  ["07:30", "Spark 분석", "7개 지표 → Top3"],
  ["08:00", "리포트 생성", "Top3 JSON 산출"],
  ["상시", "웹 서비스", "FastAPI + Next.js"],
];
const SCORES: [string, string, string, string][] = [
  ["저평가", "undervaluation_score", "25", "업종 PER/PBR 25% 이하 + ROE 양호"],
  ["수급", "investor_flow_score", "20", "외국인·기관 5일 누적 순매수 양수 (각 +10)"],
  ["거래량", "volume_spike_score", "15", "20일 평균 대비 거래량 증가"],
  ["뉴스", "news_keyword_score", "10", "긍정 뉴스/공시 가점, 부정 감점"],
  ["모멘텀", "momentum_score", "20", "5·20일 수익률 + 이동평균 추세"],
  ["실적", "earnings_score", "10", "매출·영업이익 성장률"],
  ["리스크", "risk_penalty", "감점", "변동성·부채비율·부정 뉴스"],
];
const STACK: [string, string[]][] = [
  ["데이터 수집", ["pykrx", "pandas", "pyarrow", "requests", "BeautifulSoup", "DART API"]],
  ["HDFS 저장", ["Hadoop HDFS", "Parquet", "파티션"]],
  ["Spark 분석", ["PySpark", "7지표 스코어링"]],
  ["웹", ["FastAPI", "Next.js 16", "Tailwind v4", "Recharts"]],
  ["인프라", ["Kubernetes", "Docker", "CronJob"]],
];
const TEAM = [
  ["김동성", "데이터 수집", "김"],
  ["장지은", "HDFS 저장", "장"],
  ["조상윤", "웹 (FE + BE)", "조"],
  ["허재성", "K8s 인프라", "허"],
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-border pb-2 text-lg font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

/** 소개 페이지 콘텐츠 — 히어로·파이프라인·점수 체계·기술 스택·팀. */
export function AboutSections({ className }: AboutSectionsProps) {
  return (
    <div className={cn("mx-auto flex max-w-4xl flex-col gap-10", className)}>
      {/* 히어로 */}
      <div className="rounded-md bg-primary p-8 text-primary-foreground">
        <p className="text-xs font-bold tracking-widest text-brand-light">PROJECT OVERVIEW</p>
        <h1 className="mt-2 text-2xl font-bold leading-snug">
          매일 장 마감 후 KOSPI·KOSDAQ 전 종목을 자동 수집·분석해, 다음 날 장 시작 전 08:00까지 그날의 Top3
          추천 종목을 제공하는 Hadoop·Kubernetes 기반 주식 통합 분석 플랫폼입니다.
        </h1>
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 sm:grid-cols-4">
          {STATS.map(([v, l]) => (
            <div key={l}>
              <p className="text-xl font-bold text-brand-light">{v}</p>
              <p className="mt-0.5 text-xs text-primary-foreground/80">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <Section title="프로젝트 개요">
        <p className="text-sm leading-relaxed text-muted-foreground">
          개인 투자자가 매일 전 종목의 시세·수급·뉴스·재무를 직접 살펴 유망 종목을 가려내는 일은 현실적으로
          불가능합니다. 이 플랫폼은 그 반복 작업을 분산 처리 파이프라인으로 자동화해, 7개 항목으로 점수를 매겨
          가장 점수가 높은 3개 종목을 매일 아침 한 화면에 정리해 보여줍니다. 단순 추천 서비스가 아니라
          Hadoop(HDFS)·Spark·Kubernetes로 데이터가 흐르는 분산 시스템 자체가 핵심입니다.
        </p>
      </Section>

      <Section title="데이터 파이프라인">
        <div className="flex flex-wrap items-stretch gap-2">
          {PIPELINE.map(([time, title, desc], i) => (
            <div key={title} className="flex items-center gap-2">
              <div className="flex min-w-40 flex-1 flex-col gap-1 rounded-md border border-border bg-card p-3.5">
                <span className="text-[10px] font-bold text-accent">{time}</span>
                <span className="text-sm font-bold text-foreground">{title}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </div>
              {i < PIPELINE.length - 1 && <span className="text-brand-sage">→</span>}
            </div>
          ))}
        </div>
      </Section>

      <Section title="점수 체계 (7항목)">
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold">항목</th>
                <th className="px-4 py-2.5 text-left font-semibold">영문 컬럼</th>
                <th className="px-4 py-2.5 text-center font-semibold">최대</th>
                <th className="px-4 py-2.5 text-left font-semibold">기준</th>
              </tr>
            </thead>
            <tbody>
              {SCORES.map(([ko, en, max, crit], i) => (
                <tr key={en} className={cn(i < SCORES.length - 1 && "border-b border-border")}>
                  <td className="px-4 py-2.5 font-semibold text-foreground">{ko}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{en}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-bold",
                        max === "감점" ? "bg-down/10 text-down" : "bg-accent/10 text-accent",
                      )}
                    >
                      {max}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{crit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
          final_score = 저평가 + 수급 + 거래량 + 뉴스 + 모멘텀 + 실적 − 리스크 (가점 만점 100 − 감점)
        </p>
      </Section>

      <Section title="기술 스택">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STACK.map(([layer, techs]) => (
            <div key={layer} className="flex flex-col gap-2.5 rounded-md border border-border bg-card p-4">
              <span className="text-sm font-bold text-foreground">{layer}</span>
              <div className="flex flex-wrap gap-1.5">
                {techs.map((t) => (
                  <Tag key={t} tone="neutral">
                    {t}
                  </Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="팀">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map(([name, role, initial]) => (
            <div key={name} className="flex items-center gap-3 rounded-md border border-border bg-card p-4">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {initial}
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">{name}</p>
                <p className="text-xs font-medium text-accent">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
