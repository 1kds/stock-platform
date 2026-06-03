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
  ["김동성", "데이터 수집 (크롤러 3종)", "김"],
  ["장지은", "HDFS 저장 구조", "장"],
  ["조상윤", "웹 (FastAPI + Next.js)", "조"],
  ["허재성", "Kubernetes 인프라", "허"],
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex scroll-mt-20 flex-col gap-4">
      <h2 className="border-b border-border pb-2 text-base font-bold text-foreground sm:text-lg">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium leading-relaxed text-foreground sm:text-base">{children}</p>;
}

function Body({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>;
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** 소개 페이지 콘텐츠 — 히어로·개요·파이프라인·점수 체계·기술 스택·팀. */
export function AboutSections({ className }: AboutSectionsProps) {
  return (
    <div className={cn("mx-auto flex max-w-4xl flex-col gap-8 sm:gap-10", className)}>
      {/* 히어로 */}
      <div className="rounded-md bg-primary p-6 text-primary-foreground sm:p-8">
        <p className="text-xs font-bold tracking-widest text-brand-light">PROJECT OVERVIEW</p>
        <h1 className="mt-2 text-xl font-bold leading-snug sm:text-2xl">
          매일 장 마감 후 KOSPI·KOSDAQ 전 종목을 자동 수집·분석해, 다음 날 장 시작 전 08:00까지 그날의 Top3
          추천 종목을 제공하는 Hadoop·Kubernetes 기반 주식 통합 분석 플랫폼입니다.
        </h1>
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-primary-foreground/15 pt-5 sm:grid-cols-4">
          {STATS.map(([v, l]) => (
            <div key={l}>
              <p className="text-lg font-bold text-brand-light sm:text-xl">{v}</p>
              <p className="mt-0.5 text-xs text-primary-foreground/80">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <Section title="프로젝트 개요">
        <Lead>
          개인 투자자가 매일 KOSPI·KOSDAQ 전 종목의 시세·수급·뉴스·재무를 직접 살펴 유망 종목을 가려내는 일은
          현실적으로 불가능합니다. 이 플랫폼은 그 반복 작업을 분산 처리 파이프라인으로 자동화합니다.
        </Lead>
        <Body>
          매일 장 마감 후 전 종목 데이터를 자동 수집해 Hadoop HDFS에 적재하고, 다음 날 장 시작 전 Spark로
          7개 항목 점수를 계산합니다. 가장 점수가 높은 3개 종목을 선정해 매일 아침 08:00까지 한 화면에 정리해
          보여 줍니다. 사람이 매번 화면을 들여다보지 않아도, 정해진 기준이 매일 같은 방식으로 종목을 평가한다는
          점이 핵심입니다.
        </Body>
        <Body>
          단순 추천 서비스가 아니라, 데이터가 수집 → HDFS 저장 → Spark 분석 → 웹 제공으로 흐르는 분산 시스템
          자체가 프로젝트의 본질입니다. 각 단계는 Kubernetes 위에서 독립된 작업(Job)으로 분리되어 있어, 한 단계가
          실패해도 다른 단계에 영향을 주지 않고 재시도할 수 있습니다.
        </Body>
        <Bullets
          items={[
            <>
              <span className="font-semibold text-foreground">자동화</span> — 수집·분석·리포트 생성이 모두
              스케줄(CronJob)로 매일 같은 시각에 실행됩니다.
            </>,
            <>
              <span className="font-semibold text-foreground">일관성</span> — 7개 항목으로 모든 종목을 동일한
              기준으로 채점해, 사람의 감(感)이 아닌 정량 점수로 종목을 비교합니다.
            </>,
            <>
              <span className="font-semibold text-foreground">분리된 책임</span> — 수집·저장·분석·웹이 별도
              파드로 나뉘어, 각 파트를 독립적으로 개발·배포할 수 있습니다.
            </>,
          ]}
        />
      </Section>

      <Section title="데이터 파이프라인">
        <Lead>
          데이터는 수집 → HDFS 저장 → Spark 분석 → 리포트 생성 → 웹 제공의 다섯 단계를 매일 순서대로 흐릅니다.
          각 단계는 정해진 시각에 실행되는 독립 작업입니다.
        </Lead>
        <Body>
          저녁 20:00부터 20:40까지 세 종류의 수집기가 차례로 동작합니다. 주가·수급, 공시(DART), 뉴스를 크롤링해
          모두 Parquet 형식으로 HDFS의 <code className="text-xs text-accent">/data</code> 영역에 일자 파티션
          (year=YYYY/month=MM/day=DD)으로 저장합니다. 다음 날 새벽 07:30에 Spark 분석이 이 원천 데이터를 읽어
          7개 지표로 점수를 매기고 상위 종목을 가려냅니다.
        </Body>
        <Body>
          08:00에는 리포트 생성 작업이 분석 결과를 대시보드용 Top3 JSON으로 변환해{" "}
          <code className="text-xs text-accent">/result</code> 영역에 기록합니다. 상시 떠 있는 FastAPI 서버는 이
          결과를 읽기 전용으로 제공하고, Next.js 대시보드가 이를 받아 화면에 렌더링합니다. 원천
          <code className="text-xs text-accent"> /data</code>와 산출{" "}
          <code className="text-xs text-accent">/result</code>를 명확히 분리해, 웹은 결과만 읽고 원천을 절대
          건드리지 않습니다.
        </Body>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch">
          {PIPELINE.map(([time, title, desc], i) => (
            <div key={title} className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-md border border-border bg-card p-3.5 sm:min-w-40">
                <span className="text-xs font-bold text-accent">{time}</span>
                <span className="text-sm font-bold text-foreground">{title}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </div>
              {i < PIPELINE.length - 1 && (
                <span className="rotate-90 text-brand-sage sm:rotate-0" aria-hidden>
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="점수 체계 (7항목)">
        <Lead>
          모든 종목은 저평가·수급·거래량·뉴스·모멘텀·실적의 6개 가점 항목과 리스크 감점으로 평가됩니다. 각 항목
          점수를 합산한 final_score로 종목을 정렬해 상위 3개를 추천합니다.
        </Lead>
        <Body>
          가점 항목의 만점 합은 100점입니다. 저평가(25)와 수급·모멘텀(각 20)이 비중이 크고, 거래량(15),
          뉴스·실적(각 10)이 보조합니다. 마지막으로 변동성·부채비율·부정 뉴스가 큰 종목에는 리스크 점수를 감점해,
          단기 급등에 따른 과열 종목이 무작정 상위로 올라오지 않도록 보정합니다.
        </Body>
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[34rem] overflow-hidden rounded-md border border-border">
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
        </div>
        <p className="rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
          final_score = 저평가 + 수급 + 거래량 + 뉴스 + 모멘텀 + 실적 − 리스크 (가점 만점 100 − 감점)
        </p>
        <Body>
          뉴스 점수는 현재 긍정·부정 키워드 매칭으로 단순 가감점하는 방식입니다. 아키텍처에 그려진 LLM 기반 감성
          분석은 아직 도입하지 않았으며, 향후 확장 계획으로 남겨 두었습니다.
        </Body>
      </Section>

      <Section title="기술 스택">
        <Lead>
          각 단계는 그 역할에 맞는 도구로 구현됩니다. 파이썬 수집기부터 Spark 분석, FastAPI·Next.js 웹,
          Kubernetes 운영까지 데이터 흐름을 따라 스택이 나뉩니다.
        </Lead>
        <Body>
          수집은 pykrx와 DART API로 데이터를 받아 pandas로 가공한 뒤 pyarrow로 Parquet에 씁니다. 저장은 Hadoop
          HDFS에 일자 파티션으로 적재하고, 분석은 PySpark로 7개 지표를 계산합니다. 웹은 FastAPI가 결과를 읽어
          REST로 제공하고 Next.js 16 + Tailwind v4 + Recharts가 대시보드를 그립니다. 전체는 Docker 이미지로
          묶여 Kubernetes의 CronJob·Deployment로 운영됩니다.
        </Body>
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

      <Section title="배포 환경">
        <Lead>
          전체 시스템은 master 1대와 worker 3대로 구성된 Kubernetes 클러스터 위에서 동작합니다. 노드별로 역할을
          나눠 수집·분석·웹 부하를 분리합니다.
        </Lead>
        <Body>
          master는 control-plane과 HDFS NameNode를 맡고, worker1은 수집기, worker2는 Spark 분석, worker3은
          FastAPI·대시보드 등 웹 서비스를 담당합니다. 정해진 시각에 한 번 도는 작업은 CronJob으로, 상시 떠 있어야
          하는 웹 서비스는 Deployment로 배포합니다.
        </Body>
        <Bullets
          items={[
            <>
              <span className="font-semibold text-foreground">CronJob</span> — stock-collector(20:00),
              dart-collector(20:20), news-collector(20:40), spark-analyzer(07:30),
              report-generator(08:00)가 매일 순서대로 실행됩니다.
            </>,
            <>
              <span className="font-semibold text-foreground">Deployment</span> — fastapi-server(:8000)와
              dashboard(:3000)가 상시 1개 복제본으로 떠 있고, liveness probe로 상태를 확인합니다.
            </>,
            <>
              <span className="font-semibold text-foreground">노드 분리</span> — nodeSelector로 수집은 worker1,
              분석은 worker2, 웹은 worker3에 고정해 워크로드가 섞이지 않도록 합니다.
            </>,
          ]}
        />
      </Section>

      <Section title="팀">
        <Lead>
          4명이 데이터 흐름의 각 구간을 나눠 맡았습니다. 수집·저장·분석·웹·인프라가 한 줄로 이어지도록 공통 규약을
          기준 삼아 협업합니다.
        </Lead>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map(([name, role, initial]) => (
            <div key={name} className="flex items-center gap-3 rounded-md border border-border bg-card p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {initial}
              </span>
              <div className="min-w-0">
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
