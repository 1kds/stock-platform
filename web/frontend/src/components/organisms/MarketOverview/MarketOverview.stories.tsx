import type { Meta, StoryObj } from "@storybook/react";
import { MarketOverview } from "./MarketOverview";

const meta: Meta<typeof MarketOverview> = {
  title: "Organisms/MarketOverview",
  component: MarketOverview,
};
export default meta;
type Story = StoryObj<typeof MarketOverview>;

export const Default: Story = {
  args: {
    summary: {
      total: 26,
      byMarket: { kospi: 20, kosdaq: 6 },
      avgScore: 47,
      tiers: { high: 2, mid: 5, low: 19 },
    },
  },
};

export const HighScoreDay: Story = {
  args: {
    summary: {
      total: 30,
      byMarket: { kospi: 22, kosdaq: 8 },
      avgScore: 71,
      tiers: { high: 12, mid: 14, low: 4 },
    },
  },
};
