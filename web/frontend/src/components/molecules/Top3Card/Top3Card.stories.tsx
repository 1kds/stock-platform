import type { Meta, StoryObj } from "@storybook/react";
import { Top3Card } from "./Top3Card";

const meta: Meta<typeof Top3Card> = {
  title: "Molecules/Top3Card",
  component: Top3Card,
};
export default meta;
type Story = StoryObj<typeof Top3Card>;

export const Default: Story = {
  args: {
    rankAccent: true,
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
