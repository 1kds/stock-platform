import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  args: { children: "버튼" },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary", children: "추천 보기" } };
export const Secondary: Story = { args: { variant: "secondary", children: "백테스팅 실행" } };
export const Ghost: Story = { args: { variant: "ghost", children: "더보기" } };
export const Small: Story = { args: { size: "sm", children: "실행" } };
