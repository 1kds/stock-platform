import type { Meta, StoryObj } from "@storybook/react";
import { ScoresTable } from "./ScoresTable";
import type { ScoreRow } from "@/lib/api";

const row = (
  rank: number,
  symbol: string,
  name: string,
  sector: string,
  final: number,
): ScoreRow => ({
  rank,
  symbol,
  name,
  sector,
  date: "2026-05-28",
  undervaluation_score: 22,
  investor_flow_score: 18,
  volume_spike_score: 12,
  news_keyword_score: 8,
  momentum_score: 17,
  earnings_score: 8,
  risk_penalty: 4,
  final_score: final,
});

const meta: Meta<typeof ScoresTable> = {
  title: "Organisms/ScoresTable",
  component: ScoresTable,
};
export default meta;
type Story = StoryObj<typeof ScoresTable>;

export const Default: Story = {
  args: {
    rows: [
      row(1, "005930", "삼성전자", "전기전자", 90),
      row(2, "035420", "NAVER", "서비스업", 80),
      row(3, "000660", "SK하이닉스", "전기전자", 70),
    ],
  },
};
