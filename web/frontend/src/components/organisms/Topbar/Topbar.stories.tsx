import type { Meta, StoryObj } from "@storybook/react";
import { Topbar } from "./Topbar";

const meta: Meta<typeof Topbar> = {
  title: "Organisms/Topbar",
  component: Topbar,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof Topbar>;

export const Default: Story = {};
