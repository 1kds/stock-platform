import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DatePill } from "@/components/molecules/DatePill";
import { Button } from "@/components/atoms/Button";
import type { BacktestFormProps } from "./BacktestForm.types";

const INDICATORS: [string, boolean][] = [
  ["저평가", true],
  ["수급", true],
  ["거래량", true],
  ["모멘텀", false],
  ["실적", false],
  ["뉴스", false],
];
const HOLDS = ["T+1", "T+3", "T+5", "T+20"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
    </div>
  );
}

/** 백테스팅 조건 입력 폼(표시용 목업). */
export function BacktestForm({ className }: BacktestFormProps) {
  return (
    <div className={cn("rounded-md border border-border bg-card p-5", className)}>
      <h3 className="text-base font-bold text-foreground">백테스팅 조건</h3>
      <div className="mt-4 flex flex-col gap-5">
        <Field label="분석 기간">
          <div className="flex items-center gap-2">
            <DatePill date="2026-01-01" />
            <span className="text-muted-foreground">~</span>
            <DatePill date="2026-05-29" />
          </div>
        </Field>
        <Field label="지표 조건">
          <div className="flex flex-wrap gap-2">
            {INDICATORS.map(([label, on]) => (
              <span
                key={label}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
                  on
                    ? "border-accent bg-accent/10 text-primary"
                    : "border-border bg-card text-muted-foreground",
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
              </span>
            ))}
          </div>
        </Field>
        <Field label="보유 기간">
          <div className="flex gap-2">
            {HOLDS.map((h, i) => (
              <span
                key={h}
                className={cn(
                  "rounded-md border px-4 py-2 text-sm font-semibold",
                  i === 1
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {h}
              </span>
            ))}
          </div>
        </Field>
        <div className="flex justify-end">
          <Button>백테스팅 실행</Button>
        </div>
      </div>
    </div>
  );
}
