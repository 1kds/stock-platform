import type { Meta, StoryObj } from "@storybook/react";
import { StatusDot } from "./StatusDot";

const meta: Meta<typeof StatusDot> = {
  title: "Atoms/StatusDot",
  component: StatusDot,
};
export default meta;
type Story = StoryObj<typeof StatusDot>;

export const Ok: Story = { args: { tone: "ok", label: "정상 가동 중" } };
export const Warn: Story = { args: { tone: "warn", label: "점검 필요" } };
export const Down: Story = { args: { tone: "down", label: "지연" } };
export const DotOnly: Story = { args: { tone: "ok" } };
