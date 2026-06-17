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

/** 토글로 펼친 상태 — 헤더에 셰브론, 아래에 상세 내용 노출. */
export const Expanded: Story = {
  args: {
    featured: true,
    date: "2026-05-28",
    title: "2026-05-28 Top 3 추천",
    stocks: "삼성전자 · NAVER · SK하이닉스",
    hit: true,
    ret: 3.4,
    expanded: true,
    onToggle: () => {},
    children: (
      <div className="text-sm text-muted-foreground">그날 추천 종목별 상세 분석이 여기에 표시됩니다.</div>
    ),
  },
};
