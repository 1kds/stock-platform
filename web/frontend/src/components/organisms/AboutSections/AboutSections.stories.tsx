import type { Meta, StoryObj } from "@storybook/react";
import { AboutSections } from "./AboutSections";

const meta: Meta<typeof AboutSections> = {
  title: "Organisms/AboutSections",
  component: AboutSections,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof AboutSections>;

export const Default: Story = {};
