import type { Meta, StoryObj } from "@storybook/react";
import { TrackingTable } from "./TrackingTable";

const rows = [
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
  {
    date: "2026-04-20",
    top3: [
      { rank: 1, symbol: "005930", name: "삼성전자" },
      { rank: 2, symbol: "035720", name: "카카오" },
      { rank: 3, symbol: "207940", name: "삼성바이오로직스" },
    ],
    avg_return_t3: 1.5,
    avg_return_t5: 2.0,
    hit: true,
  },
];

const meta: Meta<typeof TrackingTable> = {
  title: "Organisms/TrackingTable",
  component: TrackingTable,
};
export default meta;
type Story = StoryObj<typeof TrackingTable>;

export const Default: Story = {
  args: { rows },
};

/** 기간 필터 "최근 1주" — 최신 행 기준 7일 이내만 표시. */
export const RecentWeek: Story = {
  args: { rows, period: "최근 1주" },
};

/** 기간 필터 "최근 1개월" — 최신 행 기준 30일 이내만 표시. */
export const RecentMonth: Story = {
  args: { rows, period: "최근 1개월" },
};
