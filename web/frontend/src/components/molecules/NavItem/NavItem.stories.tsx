import type { Meta, StoryObj } from "@storybook/react";
import { LayoutDashboard } from "lucide-react";
import { NavItem } from "./NavItem";

const meta: Meta<typeof NavItem> = {
  title: "Molecules/NavItem",
  component: NavItem,
  args: { href: "/", label: "메인 대시보드", icon: LayoutDashboard },
};
export default meta;
type Story = StoryObj<typeof NavItem>;

export const Active: Story = { args: { active: true } };
export const Default: Story = { args: { active: false } };
