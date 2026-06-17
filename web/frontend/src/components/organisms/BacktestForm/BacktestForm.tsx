"use client";

import { useState, type ReactNode } from "react";
import { Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DatePill } from "@/components/molecules/DatePill";
import { Dropdown } from "@/components/molecules/Dropdown";
import { Button } from "@/components/atoms/Button";
import {
  INDICATOR_OPTIONS,
  OPERATOR_OPTIONS,
  BACKTEST_UNIVERSES,
  indicatorMeta,
  type BacktestCondition,
  type BacktestOperator,
} from "@/lib/backtest";
import type { BacktestFormProps } from "./BacktestForm.types";

/** 보유 기간 옵션(원본 텍스트 유지). */
export const BACKTEST_HOLDS = ["T+1", "T+3", "T+5", "T+20"];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/** 라벨 + 숫자 입력(접두/접미 기호). 손절·익절·자본·비중·비용 공용. */
function NumField({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5">
        {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm tabular-nums text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </span>
    </label>
  );
}

/** 백테스팅 조건 입력 폼(제어 컴포넌트). 매수/매도 조건·종목·자금·비용·실행. */
export function BacktestForm({ value, onChange, onRun, className }: BacktestFormProps) {
  // 종목 입력 중인 임시 텍스트(폼 값 아님 — 확정 시 value.symbols로 들어감).
  const [symbolDraft, setSymbolDraft] = useState("");
  // 조건 패널 접힘/펼침 (UI 상태).
  const [open, setOpen] = useState(true);

  function addSymbol() {
    const s = symbolDraft.trim();
    if (!s || value.symbols.includes(s)) {
      setSymbolDraft("");
      return;
    }
    onChange({ ...value, symbols: [...value.symbols, s] });
    setSymbolDraft("");
  }
  function removeSymbol(s: string) {
    onChange({ ...value, symbols: value.symbols.filter((x) => x !== s) });
  }

  function patchCondition(i: number, patch: Partial<BacktestCondition>) {
    onChange({
      ...value,
      conditions: value.conditions.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    });
  }
  function addCondition() {
    onChange({
      ...value,
      conditions: [...value.conditions, { indicator: "per", operator: "lte", value: "" }],
    });
  }
  function removeCondition(i: number) {
    onChange({ ...value, conditions: value.conditions.filter((_, idx) => idx !== i) });
  }

  return (
    <div className={cn("rounded-md border border-border bg-card p-5 shadow-sm", className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-base font-bold text-foreground">백테스팅 조건</h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "조건 접기" : "조건 펼치기"}
          className="inline-flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {open ? <Minus className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
        </button>
      </div>
      {open && (
        <div className="mt-4 flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="분석 기간">
            {/* 표시 전용 — 기간 편집 UI는 향후 확장(BacktestForm.types 참조). */}
            <div className="flex items-center gap-2">
              <DatePill date={value.start} />
              <span className="text-muted-foreground">~</span>
              <DatePill date={value.end} />
            </div>
          </Field>
          <Field label="종목 유니버스">
            <Dropdown
              label="유니버스"
              options={[...BACKTEST_UNIVERSES]}
              value={value.universe}
              onChange={(v) => onChange({ ...value, universe: v })}
            />
          </Field>
          <Field label="종목" hint="비우면 전체">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  value={symbolDraft}
                  onChange={(e) => setSymbolDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSymbol();
                    }
                  }}
                  aria-label="종목명 또는 코드"
                  placeholder="예: 삼성전자, 005930"
                  className="min-w-0 flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button variant="secondary" size="sm" onClick={addSymbol} className="shrink-0">
                  <Plus className="size-4" aria-hidden />
                  추가
                </Button>
              </div>
              {value.symbols.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {value.symbols.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-foreground"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSymbol(s)}
                        aria-label={`${s} 삭제`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3.5" aria-hidden />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Field>
        </div>

        <Field label="매수 조건" hint="모두 만족 시 매수 (AND)">
          <div className="flex flex-col gap-2">
            {value.conditions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                조건이 없습니다. 아래에서 추가하세요.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {value.conditions.map((c, i) => {
                const unit = indicatorMeta(c.indicator)?.unit;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 rounded-md border border-border bg-muted/30 p-1.5"
                  >
                    <Dropdown
                      label="지표"
                      bare
                      options={INDICATOR_OPTIONS}
                      value={c.indicator}
                      onChange={(v) => patchCondition(i, { indicator: v })}
                    />
                    <Dropdown
                      label="연산"
                      bare
                      options={OPERATOR_OPTIONS}
                      value={c.operator}
                      onChange={(v) => patchCondition(i, { operator: v as BacktestOperator })}
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      value={c.value}
                      onChange={(e) => patchCondition(i, { value: e.target.value })}
                      aria-label="기준값"
                      placeholder="값"
                      className="w-20 rounded-md border border-border bg-card px-2.5 py-2 text-sm tabular-nums text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
                    <button
                      type="button"
                      onClick={() => removeCondition(i)}
                      aria-label="조건 삭제"
                      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                );
              })}
            </div>
            <div>
              <Button variant="secondary" size="sm" onClick={addCondition}>
                <Plus className="size-4" aria-hidden />
                조건 추가
              </Button>
            </div>
          </div>
        </Field>

        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="매도 조건" hint="보유기간 전이라도 청산">
            <div className="grid grid-cols-2 gap-3">
              <NumField
                label="손절 (하락)"
                value={value.stopLoss}
                onChange={(v) => onChange({ ...value, stopLoss: v })}
                placeholder="예: 5"
                prefix="−"
                suffix="%"
              />
              <NumField
                label="익절 (상승)"
                value={value.takeProfit}
                onChange={(v) => onChange({ ...value, takeProfit: v })}
                placeholder="예: 10"
                prefix="+"
                suffix="%"
              />
            </div>
          </Field>

          <Field label="보유 기간">
            <div role="radiogroup" aria-label="보유 기간" className="flex flex-wrap gap-2">
              {BACKTEST_HOLDS.map((h) => {
                const active = value.hold === h;
                return (
                  <button
                    key={h}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onChange({ ...value, hold: h })}
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
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="자금 설정">
            <div className="grid grid-cols-2 gap-3">
              <NumField
                label="초기 자본금"
                value={value.capital}
                onChange={(v) => onChange({ ...value, capital: v })}
                placeholder="예: 10000000"
                suffix="원"
              />
              <NumField
                label="종목당 비중"
                value={value.positionPct}
                onChange={(v) => onChange({ ...value, positionPct: v })}
                placeholder="예: 20"
                suffix="%"
              />
            </div>
          </Field>

          <Field label="거래 비용">
            <div className="grid grid-cols-2 gap-3">
              <NumField
                label="수수료"
                value={value.fee}
                onChange={(v) => onChange({ ...value, fee: v })}
                placeholder="예: 0.015"
                suffix="%"
              />
              <NumField
                label="세금"
                value={value.tax}
                onChange={(v) => onChange({ ...value, tax: v })}
                placeholder="예: 0.23"
                suffix="%"
              />
            </div>
          </Field>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onRun(value)}>백테스팅 실행</Button>
        </div>
        </div>
      )}
    </div>
  );
}
