import type { Meta, StoryObj } from "@storybook/react";
import { AboutNav } from "./AboutNav";

const meta: Meta<typeof AboutNav> = {
  title: "Organisms/AboutNav",
  component: AboutNav,
};
export default meta;

type Story = StoryObj<typeof AboutNav>;

/** 소개 페이지 우측 목차. (스토리에선 섹션 요소가 없어 첫 항목이 기본 강조) */
export const Default: Story = {};
