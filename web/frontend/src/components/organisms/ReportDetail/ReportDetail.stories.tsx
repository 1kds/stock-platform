import type { Meta, StoryObj } from "@storybook/react";
import { ReportDetail } from "./ReportDetail";

const meta: Meta<typeof ReportDetail> = {
  title: "Organisms/ReportDetail",
  component: ReportDetail,
};
export default meta;
type Story = StoryObj<typeof ReportDetail>;

const STOCKS = [
  { rank: 1, symbol: "005930", name: "삼성전자" },
  { rank: 2, symbol: "035420", name: "NAVER" },
  { rank: 3, symbol: "000660", name: "SK하이닉스" },
];

/** 점수 데이터가 있어 종목별 점수바 + 서술 설명 + 선정 사유까지 노출. */
export const WithScores: Story = {
  args: {
    stocks: STOCKS,
    day: { avg_return_t5: 3.4, hit: true },
    detail: [
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
};

/** 점수 데이터가 없는 과거 이력 — 순위·실제 결과 기반 간단 설명만 노출. */
export const ResultOnly: Story = {
  args: {
    stocks: STOCKS,
    day: { avg_return_t5: -1.3, hit: false },
  },
};
