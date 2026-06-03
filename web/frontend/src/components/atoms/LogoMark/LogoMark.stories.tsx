import type { Meta, StoryObj } from "@storybook/react";
import { LogoMark } from "./LogoMark";

const meta: Meta<typeof LogoMark> = {
  title: "Atoms/LogoMark",
  component: LogoMark,
};
export default meta;
type Story = StoryObj<typeof LogoMark>;

export const Default: Story = {};
