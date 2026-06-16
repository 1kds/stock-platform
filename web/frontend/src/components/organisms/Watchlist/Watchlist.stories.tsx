import type { Meta, StoryObj } from "@storybook/react";
import type { ScoreRow } from "@/lib/api";
import { Watchlist } from "./Watchlist";

/** 샘플 행 (4~8위). 실제 데이터는 /api/scores 에서 slice. */
function row(
  rank: number,
  symbol: string,
  name: string,
  sector: string,
  market: string,
  final_score: number,
): ScoreRow {
  return {
    rank,
    symbol,
    name,
    sector,
    market,
    date: "2026-05-28",
    undervaluation_score: 18,
    investor_flow_score: 14,
    volume_spike_score: 9,
    news_keyword_score: 6,
    momentum_score: 12,
    earnings_score: 7,
    risk_penalty: 4,
    final_score,
  };
}

const meta: Meta<typeof Watchlist> = {
  title: "Organisms/Watchlist",
  component: Watchlist,
};
export default meta;
type Story = StoryObj<typeof Watchlist>;

export const Default: Story = {
  args: {
    rows: [
      row(4, "207940", "삼성바이오로직스", "의약품", "KOSPI", 68),
      row(5, "005380", "현대차", "운수장비", "KOSPI", 65),
      row(6, "247540", "에코프로비엠", "화학", "KOSDAQ", 63),
      row(7, "000270", "기아", "운수장비", "KOSPI", 61),
      row(8, "068270", "셀트리온", "의약품", "KOSPI", 59),
    ],
  },
};
