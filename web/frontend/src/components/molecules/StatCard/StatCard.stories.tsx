import type { Meta, StoryObj } from "@storybook/react";
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
