import type { Meta, StoryObj } from "@storybook/react";
import { Target, TrendingUp, Trophy } from "lucide-react";
import { StatCard } from "./StatCard";

const meta: Meta<typeof StatCard> = {
  title: "Molecules/StatCard",
  component: StatCard,
};
export default meta;
type Story = StoryObj<typeof StatCard>;

export const HitRate: Story = { args: { label: "적중률", value: "67%", sub: "83 / 124 종목" } };
export const Return: Story = {
  args: { label: "평균 수익률", value: "+4.2%", valueTone: "up", trend: 5 },
};
export const Loss: Story = {
  args: { label: "평균 수익률", value: "-2.8%", valueTone: "down", trend: -3 },
};

/** 우상단 지표 아이콘 추가 — 빈 카드에 정보감을 준다. */
export const WithIcon: Story = {
  args: { label: "적중률", value: "70.6%", sub: "최근 추천 기준", icon: Target },
};
export const WithIconReturn: Story = {
  args: { label: "평균 수익률", value: "+2.0%", valueTone: "up", icon: TrendingUp },
};
export const WithIconCount: Story = {
  args: { label: "추천 종목", value: "3", sub: "오늘 Top3", icon: Trophy },
};
