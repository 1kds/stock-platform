"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DatePill } from "@/components/molecules/DatePill";
import { Button } from "@/components/atoms/Button";
import type { BacktestFormProps } from "./BacktestForm.types";

/** 선택 가능한 지표 라벨(원본 순서·텍스트 유지). */
export const BACKTEST_INDICATORS = ["저평가", "수급", "거래량", "모멘텀", "실적", "뉴스"];
/** 보유 기간 옵션(원본 텍스트 유지). */
export const BACKTEST_HOLDS = ["T+1", "T+3", "T+5", "T+20"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
    </div>
  );
}

/** 백테스팅 조건 입력 폼(제어 컴포넌트). 지표 체크·보유기간 라디오·실행 버튼. */
export function BacktestForm({ value, onChange, onRun, className }: BacktestFormProps) {
  function toggleIndicator(label: string) {
    const next = value.indicators.includes(label)
      ? value.indicators.filter((i) => i !== label)
      : [...value.indicators, label];
    onChange({ ...value, indicators: next });
  }

  function setHold(hold: string) {
    onChange({ ...value, hold });
  }

  return (
    <div className={cn("rounded-md border border-border bg-card p-5", className)}>
      <h3 className="text-base font-bold text-foreground">백테스팅 조건</h3>
      <div className="mt-4 flex flex-col gap-5">
        <Field label="분석 기간">
          {/*
            분석 기간(start/end)은 현재 표시 전용이다. 날짜 선택 UI(date input/Dropdown)는
            아직 도입하지 않았으므로 value.start/end는 호출부가 넘긴 초기값에 고정된다.
            기간 편집이 필요하면 DatePill을 트리거로 바꾸고 onChange({ ...value, start/end })를 연결할 것.
          */}
          <div className="flex items-center gap-2">
            <DatePill date={value.start} />
            <span className="text-muted-foreground">~</span>
            <DatePill date={value.end} />
          </div>
        </Field>
        <Field label="지표 조건">
          <div className="flex flex-wrap gap-2">
            {BACKTEST_INDICATORS.map((label) => {
              const on = value.indicators.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleIndicator(label)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                    on
                      ? "border-accent bg-accent/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded",
                      on ? "bg-accent text-accent-foreground" : "border border-border",
                    )}
                  >
                    {on && <Check className="size-3" />}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="보유 기간">
          <div role="radiogroup" aria-label="보유 기간" className="flex gap-2">
            {BACKTEST_HOLDS.map((h) => {
              const active = value.hold === h;
              return (
                <button
                  key={h}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setHold(h)}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-muted",
                  )}
                >
                  {h}
                </button>
              );
            })}
          </div>
        </Field>
        <div className="flex justify-end">
          <Button onClick={() => onRun(value)}>백테스팅 실행</Button>
        </div>
      </div>
    </div>
  );
}
