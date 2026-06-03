import type { Meta, StoryObj } from "@storybook/react";
import { Topbar } from "./Topbar";

const meta: Meta<typeof Topbar> = {
  title: "Organisms/Topbar",
  component: Topbar,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof Topbar>;

/** 데스크톱: 좌 로고 · 중앙 링크 · 우 업데이트/아바타. */
export const Default: Story = {};

/** 모바일(<lg): 햄버거 + 응축된 우측. 햄버거 클릭 시 오프캔버스 드로어. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
