import type { Meta, StoryObj } from "@storybook/react";
import { DatePill } from "./DatePill";

const meta: Meta<typeof DatePill> = {
  title: "Molecules/DatePill",
  component: DatePill,
  args: { date: "2026년 6월 1일 (월)" },
};
export default meta;
type Story = StoryObj<typeof DatePill>;

export const Default: Story = {};
