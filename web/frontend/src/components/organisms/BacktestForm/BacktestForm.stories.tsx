import type { Meta, StoryObj } from "@storybook/react";
import { BacktestForm } from "./BacktestForm";

const meta: Meta<typeof BacktestForm> = {
  title: "Organisms/BacktestForm",
  component: BacktestForm,
};
export default meta;
type Story = StoryObj<typeof BacktestForm>;

export const Default: Story = {};
