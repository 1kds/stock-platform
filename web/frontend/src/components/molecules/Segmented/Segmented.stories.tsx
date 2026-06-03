import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Segmented } from "./Segmented";

const meta: Meta<typeof Segmented> = {
  title: "Molecules/Segmented",
  component: Segmented,
  args: { options: ["전체", "KOSPI", "KOSDAQ"], value: "전체" },
};
export default meta;
type Story = StoryObj<typeof Segmented>;

export const Default: Story = {};

function ControlledSegmented() {
  const options = ["전체", "KOSPI", "KOSDAQ"];
  const [value, setValue] = useState(options[0]);
  return <Segmented options={options} value={value} onChange={setValue} />;
}

/** controlled — 클릭 시 선택 세그먼트가 바뀐다. */
export const Controlled: Story = {
  render: () => <ControlledSegmented />,
};
