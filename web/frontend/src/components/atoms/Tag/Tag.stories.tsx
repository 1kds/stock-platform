import type { Meta, StoryObj } from "@storybook/react";
import { Tag } from "./Tag";

const meta: Meta<typeof Tag> = {
  title: "Atoms/Tag",
  component: Tag,
  args: { children: "수급 강세" },
};
export default meta;
type Story = StoryObj<typeof Tag>;

export const Green: Story = { args: { tone: "green", children: "수급 강세" } };
export const Neutral: Story = { args: { tone: "neutral", children: "보합" } };
