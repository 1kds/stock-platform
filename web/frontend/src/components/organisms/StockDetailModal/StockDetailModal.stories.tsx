import type { Meta, StoryObj } from "@storybook/react";
import { StockDetailModal } from "./StockDetailModal";

const meta: Meta<typeof StockDetailModal> = {
  title: "Organisms/StockDetailModal",
  component: StockDetailModal,
};
export default meta;
type Story = StoryObj<typeof StockDetailModal>;

export const Open: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    item: {
      rank: 1,
      symbol: "005930",
      name: "삼성전자",
      final_score: 90,
      scores: {
        undervaluation: 24,
        investor_flow: 20,
        volume_spike: 13,
        news_keyword: 9,
        momentum: 19,
        earnings: 9,
        risk_penalty: 4,
      },
      reason: "저평가·수급·모멘텀 점수가 모두 높음",
    },
  },
};
