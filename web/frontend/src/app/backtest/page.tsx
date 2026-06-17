"use client";

import { useEffect, useMemo, useState } from "react";
import { getBacktest, type BacktestResponse } from "@/lib/api";
import {
  BacktestForm,
  type BacktestFormState,
} from "@/components/organisms/BacktestForm";
import { BacktestResult } from "@/components/organisms/BacktestResult";
import { LoadingState, ErrorState } from "@/components/organisms/StateViews";
import { DEFAULT_CONDITIONS, formatCondition } from "@/lib/backtest";

// 보유 기간 라벨 → 일수.
const HOLD_DAYS: Record<string, number> = { "T+1": 1, "T+3": 3, "T+5": 5, "T+20": 20 };

const INITIAL_FORM: BacktestFormState = {
  start: "2026-01-01",
  end: "2026-05-29",
  conditions: DEFAULT_CONDITIONS,
  symbols: [],
  hold: "T+3",
  universe: "all",
  stopLoss: "5",
  takeProfit: "10",
  capital: "10000000",
  positionPct: "20",
  fee: "0.015",
  tax: "0.23",
};

/**
 * mock 응답 + 폼 입력 → 클라이언트 계산으로 결과 반영.
 * (UI/폼 단계: 조건식은 결과에 반영되지 않고 보유기간만 반영. 실제 조건 평가는 백엔드 실연동 단계.)
 */
function applyForm(base: BacktestResponse, form: BacktestFormState): BacktestResponse {
  const horizons = base.returns_by_horizon;
  const target = horizons.find((h) => h.horizon === form.hold) ?? horizons.at(-1);
  return {
    ...base,
    period: { start: form.start, end: form.end },
    hold: HOLD_DAYS[form.hold] ?? base.hold,
    indicators: form.conditions.map((c) => c.indicator),
    summary: {
      ...base.summary,
      // 선택한 보유기간의 Top3 수익률을 평균 수익률 지표에 반영.
      avg_return: target ? target.top3_return : base.summary.avg_return,
    },
  };
}

export default function BacktestPage() {
  const [base, setBase] = useState<BacktestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<BacktestFormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState<BacktestFormState>(INITIAL_FORM);

  useEffect(() => {
    getBacktest(INITIAL_FORM.start, INITIAL_FORM.end, HOLD_DAYS[INITIAL_FORM.hold])
      .then(setBase)
      .catch((e) => setError(String(e)));
  }, []);

  const result = useMemo(
    () => (base ? applyForm(base, submitted) : null),
    [base, submitted],
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">백테스팅</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          과거 데이터로 추천 전략의 수익률과 승률을 검증합니다
        </p>
      </div>
      <BacktestForm value={form} onChange={setForm} onRun={setSubmitted} />
      {error && <ErrorState message={error} />}
      {!result && !error && <LoadingState />}
      {result && (
        <>
          {submitted.conditions.some((c) => c.value !== "") && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">적용 조건</span>
              {submitted.conditions
                .filter((c) => c.value !== "")
                .map((c, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs tabular-nums text-muted-foreground"
                  >
                    {formatCondition(c)}
                  </span>
                ))}
              {submitted.symbols.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  · 종목 {submitted.symbols.join(", ")}
                </span>
              )}
              <span className="text-xs text-muted-foreground">· 보유 {submitted.hold}</span>
            </div>
          )}
          <BacktestResult data={result} />
        </>
      )}
    </div>
  );
}
