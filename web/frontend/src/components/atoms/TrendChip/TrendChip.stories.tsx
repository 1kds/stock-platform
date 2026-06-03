import type { Meta, StoryObj } from "@storybook/react";
import { TrendChip } from "./TrendChip";

const meta: Meta<typeof TrendChip> = {
  title: "Atoms/TrendChip",
  component: TrendChip,
};
export default meta;
type Story = StoryObj<typeof TrendChip>;

export const Up: Story = { args: { value: 2.3 } };
export const Down: Story = { args: { value: -1.1 } };
export const Flat: Story = { args: { value: 0 } };
