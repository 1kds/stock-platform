import type { Meta, StoryObj } from "@storybook/react";
import { ScoreBadge } from "./ScoreBadge";

const meta: Meta<typeof ScoreBadge> = {
  title: "Atoms/ScoreBadge",
  component: ScoreBadge,
  tags: ["autodocs"],
  argTypes: {
    score: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
  args: { score: 90 },
};
export default meta;

type Story = StoryObj<typeof ScoreBadge>;

// 4단계 색: strong(≥85 petrol) / high(≥70 green) / mid(≥55 light) / low(<55 회색)
export const Strong: Story = { args: { score: 90 } };
export const High: Story = { args: { score: 76 } };
export const Mid: Story = { args: { score: 60 } };
export const Low: Story = { args: { score: 48 } };

/** 같은 줄에 4단계를 나란히 — 점수 대비가 한눈에. */
export const Scale: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      {[92, 78, 62, 45].map((s) => (
        <ScoreBadge key={s} score={s} />
      ))}
    </div>
  ),
};
