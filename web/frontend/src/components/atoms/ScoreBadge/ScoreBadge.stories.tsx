import type { Meta, StoryObj } from "@storybook/react";
import { ScoreBadge } from "./ScoreBadge";

const meta: Meta<typeof ScoreBadge> = {
  title: "Atoms/ScoreBadge",
  component: ScoreBadge,
  tags: ["autodocs"],
  argTypes: {
    score: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
  args: { score: 90 },
};
export default meta;

type Story = StoryObj<typeof ScoreBadge>;

export const High: Story = { args: { score: 90 } };
export const Mid: Story = { args: { score: 72 } };
export const Low: Story = { args: { score: 55 } };
