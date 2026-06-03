import type { Meta, StoryObj } from "@storybook/react";
import { ReturnChart } from "./ReturnChart";

const meta: Meta<typeof ReturnChart> = {
  title: "Organisms/ReturnChart",
  component: ReturnChart,
};
export default meta;
type Story = StoryObj<typeof ReturnChart>;

export const Default: Story = {
  args: {
    data: [
      { date: "5/1", return: 0.5 },
      { date: "5/4", return: 1.2 },
      { date: "5/7", return: -0.8 },
      { date: "5/11", return: 2.1 },
      { date: "5/14", return: 1.7 },
      { date: "5/18", return: 3.0 },
    ],
  },
};
