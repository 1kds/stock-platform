import type { Meta, StoryObj } from "@storybook/react";
import { SectorDistribution } from "./SectorDistribution";

const meta: Meta<typeof SectorDistribution> = {
  title: "Organisms/SectorDistribution",
  component: SectorDistribution,
};
export default meta;
type Story = StoryObj<typeof SectorDistribution>;

export const Default: Story = {
  args: {
    data: [
      { sector: "서비스업", count: 6 },
      { sector: "전기전자", count: 5 },
      { sector: "화학", count: 4 },
      { sector: "금융업", count: 4 },
      { sector: "의약품", count: 3 },
      { sector: "운수장비", count: 3 },
      { sector: "유통업", count: 1 },
    ],
  },
};
