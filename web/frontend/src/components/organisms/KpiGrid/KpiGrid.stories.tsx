import type { Meta, StoryObj } from "@storybook/react";
import { KpiGrid } from "./KpiGrid";

const meta: Meta<typeof KpiGrid> = {
  title: "Organisms/KpiGrid",
  component: KpiGrid,
};
export default meta;
type Story = StoryObj<typeof KpiGrid>;

export const Default: Story = {
  args: {
    items: [
      { label: "적중률", value: "67%", sub: "83 / 124 종목" },
      { label: "평균 수익률", value: "+4.2%", valueTone: "up" },
      { label: "추천 종목", value: "3", sub: "오늘 Top3" },
      { label: "분석 종목", value: "2,431", sub: "KOSPI+KOSDAQ" },
    ],
  },
};
