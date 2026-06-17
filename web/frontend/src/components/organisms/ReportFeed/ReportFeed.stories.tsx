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

/** 최신 카드에 오늘의 Top3 점수 데이터를 연결 — 펼치면 종목별 점수바·서술 노출. */
export const WithDetail: Story = {
  args: {
    rows: Default.args!.rows,
    detail: {
      date: "2026-05-28",
      updated_at: "2026-05-29 08:00",
      top3: [
        {
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
        {
          rank: 2,
          symbol: "035420",
          name: "NAVER",
          final_score: 80,
          scores: {
            undervaluation: 22,
            investor_flow: 14,
            volume_spike: 11,
            news_keyword: 7,
            momentum: 18,
            earnings: 10,
            risk_penalty: 2,
          },
          reason: "저평가 및 모멘텀 점수가 양호함",
        },
        {
          rank: 3,
          symbol: "000660",
          name: "SK하이닉스",
          final_score: 70,
          scores: {
            undervaluation: 18,
            investor_flow: 20,
            volume_spike: 14,
            news_keyword: 6,
            momentum: 12,
            earnings: 5,
            risk_penalty: 5,
          },
          reason: "투자자 수급과 거래량 점수가 높음",
        },
      ],
    },
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
