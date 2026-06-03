import type { Meta, StoryObj } from "@storybook/react";
import { ReportFeed } from "./ReportFeed";

const meta: Meta<typeof ReportFeed> = {
  title: "Organisms/ReportFeed",
  component: ReportFeed,
};
export default meta;
type Story = StoryObj<typeof ReportFeed>;

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
        date: "2026-05-27",
        top3: [
          { rank: 1, symbol: "000660", name: "SK하이닉스" },
          { rank: 2, symbol: "005930", name: "삼성전자" },
          { rank: 3, symbol: "005380", name: "현대차" },
        ],
        avg_return_t3: 1.5,
        avg_return_t5: 2.8,
        hit: true,
      },
      {
        date: "2026-05-26",
        top3: [
          { rank: 1, symbol: "005380", name: "현대차" },
          { rank: 2, symbol: "000270", name: "기아" },
          { rank: 3, symbol: "005490", name: "POSCO홀딩스" },
        ],
        avg_return_t3: -0.8,
        avg_return_t5: -1.3,
        hit: false,
      },
    ],
  },
};

/** 추천 이력이 단 하루뿐 — featured 카드만 노출되는 상태 */
export const SingleEntry: Story = {
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
    ],
  },
};
