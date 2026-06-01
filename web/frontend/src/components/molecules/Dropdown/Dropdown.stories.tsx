import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown } from "./Dropdown";

const meta: Meta<typeof Dropdown> = {
  title: "Molecules/Dropdown",
  component: Dropdown,
  args: { label: "업종 전체" },
};
export default meta;
type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {};
