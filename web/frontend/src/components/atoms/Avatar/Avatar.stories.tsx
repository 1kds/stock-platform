import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Atoms/Avatar",
  component: Avatar,
  args: { initial: "조" },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};
