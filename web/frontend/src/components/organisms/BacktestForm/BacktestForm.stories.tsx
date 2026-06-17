import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { BacktestForm } from "./BacktestForm";
import type { BacktestFormState } from "./BacktestForm.types";
import { DEFAULT_CONDITIONS } from "@/lib/backtest";

const meta: Meta<typeof BacktestForm> = {
  title: "Organisms/BacktestForm",
  component: BacktestForm,
};
export default meta;
type Story = StoryObj<typeof BacktestForm>;

function ControlledForm() {
  const [value, setValue] = useState<BacktestFormState>({
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
  });
  return <BacktestForm value={value} onChange={setValue} onRun={() => {}} />;
}

/** controlled — 조건식 추가/삭제·연산자·값 입력·보유기간이 상태에 반영. */
export const Default: Story = {
  render: () => <ControlledForm />,
};
