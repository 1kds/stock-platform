import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "./Sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Organisms/Sidebar",
  component: Sidebar,
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

/** 데스크톱 고정 사이드바 (기본). */
export const Default: Story = {};

/** 모바일 오프캔버스 드로어 내부에서 쓰이는 형태 (폭은 부모가 제어). */
export const Drawer: Story = {
  args: { variant: "drawer" },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};
