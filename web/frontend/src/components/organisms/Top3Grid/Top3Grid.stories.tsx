import type { Meta, StoryObj } from "@storybook/react";
import { Top3Grid } from "./Top3Grid";
import type { Top3Item } from "@/lib/api";

const mk = (rank: number, symbol: string, name: string, score: number): Top3Item => ({
  rank,
  symbol,
  name,
  final_score: score,
  scores: {
    undervaluation: 22,
    investor_flow: 18,
    volume_spike: 12,
    news_keyword: 8,
    momentum: 18,
    earnings: 8,
    risk_penalty: 4,
  },
  reason: "저평가·수급·모멘텀 점수가 높음",
});

const meta: Meta<typeof Top3Grid> = {
  title: "Organisms/Top3Grid",
  component: Top3Grid,
};
export default meta;
type Story = StoryObj<typeof Top3Grid>;

export const Default: Story = {
  args: {
    items: [
      mk(1, "005930", "삼성전자", 90),
      mk(2, "035420", "NAVER", 80),
      mk(3, "000660", "SK하이닉스", 70),
    ],
  },
};
