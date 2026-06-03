import type { Meta, StoryObj } from "@storybook/react";
import { Segmented } from "./Segmented";

const meta: Meta<typeof Segmented> = {
  title: "Molecules/Segmented",
  component: Segmented,
  args: { options: ["전체", "KOSPI", "KOSDAQ"], value: "전체" },
};
export default meta;
type Story = StoryObj<typeof Segmented>;

export const Default: Story = {};
