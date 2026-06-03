import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { BacktestForm } from "./BacktestForm";
import type { BacktestFormState } from "./BacktestForm.types";

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
    indicators: ["저평가", "수급", "거래량"],
    hold: "T+3",
  });
  return <BacktestForm value={value} onChange={setValue} onRun={() => {}} />;
}

/** controlled — 지표 토글·보유기간 선택·실행이 상태에 반영. */
export const Default: Story = {
  render: () => <ControlledForm />,
};
