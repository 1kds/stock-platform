import type { Meta, StoryObj } from "@storybook/react";
import { ScoreBar } from "./ScoreBar";

const meta: Meta<typeof ScoreBar> = {
  title: "Molecules/ScoreBar",
  component: ScoreBar,
};
export default meta;
type Story = StoryObj<typeof ScoreBar>;

export const Undervaluation: Story = { args: { label: "저평가", value: 24, max: 25 } };
export const Risk: Story = { args: { label: "리스크", value: 4, max: 15, penalty: true } };
