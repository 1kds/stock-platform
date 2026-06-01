import type { Meta, StoryObj } from "@storybook/react";
import { TrackingTable } from "./TrackingTable";

const meta: Meta<typeof TrackingTable> = {
  title: "Organisms/TrackingTable",
  component: TrackingTable,
};
export default meta;
type Story = StoryObj<typeof TrackingTable>;

export const Default: Story = {
  args: {
    rows: [
      {
        date: "2026-05-28",
        top3: [
          { rank: 1, symbol: "005930", name: "삼성전자" },
          { rank: 2, symbol: "035420", name: "NAVER" },
          { rank: 3, symbol: "000660", name: "SK하이닉스" },
        ],
        avg_return_t3: 2.1,
        avg_return_t5: 3.4,
        hit: true,
      },
      {
        date: "2026-05-26",
        top3: [
          { rank: 1, symbol: "035420", name: "NAVER" },
          { rank: 2, symbol: "051910", name: "LG화학" },
          { rank: 3, symbol: "000660", name: "SK하이닉스" },
        ],
        avg_return_t3: -0.7,
        avg_return_t5: 0.4,
        hit: false,
      },
    ],
  },
};
