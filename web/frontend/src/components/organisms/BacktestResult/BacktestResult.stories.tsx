import type { Meta, StoryObj } from "@storybook/react";
import { BacktestResult } from "./BacktestResult";

const meta: Meta<typeof BacktestResult> = {
  title: "Organisms/BacktestResult",
  component: BacktestResult,
};
export default meta;
type Story = StoryObj<typeof BacktestResult>;

export const Default: Story = {
  args: {
    data: {
      period: { start: "2026-01-01", end: "2026-05-29" },
      hold: 5,
      indicators: ["undervaluation", "momentum"],
      summary: { avg_return: 4.2, win_rate: 58.3, max_drawdown: -7.1 },
      returns_by_horizon: [
        { horizon: "T+1", top3_return: 1.2, market_return: 0.5, excess: 0.7 },
        { horizon: "T+3", top3_return: 2.4, market_return: 1.1, excess: 1.3 },
        { horizon: "T+5", top3_return: 4.2, market_return: 1.5, excess: 2.7 },
        { horizon: "T+20", top3_return: 6.8, market_return: 4.0, excess: 2.8 },
      ],
    },
  },
};
