import type { Meta, StoryObj } from "@storybook/react";
import { ReportCard } from "./ReportCard";

const meta: Meta<typeof ReportCard> = {
  title: "Molecules/ReportCard",
  component: ReportCard,
};
export default meta;
type Story = StoryObj<typeof ReportCard>;

export const Hit: Story = {
  args: {
    featured: true,
    date: "2026-05-29 (목)",
    title: "5월 29일 Top 3 — 반도체 강세",
    stocks: "삼성전자 · NAVER · SK하이닉스",
    hit: true,
    ret: 4.2,
  },
};
export const Miss: Story = {
  args: {
    date: "2026-05-27 (화)",
    title: "5월 27일 Top 3 — 자동차 약세",
    stocks: "현대차 · 기아 · POSCO홀딩스",
    hit: false,
    ret: -1.3,
  },
};
