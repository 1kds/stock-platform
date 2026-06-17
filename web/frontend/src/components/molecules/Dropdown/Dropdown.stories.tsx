import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Dropdown } from "./Dropdown";

const meta: Meta<typeof Dropdown> = {
  title: "Molecules/Dropdown",
  component: Dropdown,
  args: { label: "업종 전체" },
};
export default meta;
type Story = StoryObj<typeof Dropdown>;

/** 표시 전용(목업) 트리거 — options 없음. */
export const Default: Story = {};

const SECTORS = [
  { value: "전체", label: "업종 전체" },
  { value: "전기전자", label: "전기전자" },
  { value: "서비스업", label: "서비스업" },
  { value: "화학", label: "화학" },
];

function ControlledDropdown() {
  const [value, setValue] = useState("전체");
  return <Dropdown label="업종" options={SECTORS} value={value} onChange={setValue} />;
}

/** controlled 메뉴 — 클릭 시 선택값이 트리거에 반영. */
export const Controlled: Story = {
  render: () => <ControlledDropdown />,
};

function BareDropdown() {
  const [value, setValue] = useState("전기전자");
  return <Dropdown label="업종" bare options={SECTORS} value={value} onChange={setValue} />;
}

/** bare — 접두 라벨 없이 선택값만 표시(조건 빌더 등 좁은 공간용). */
export const Bare: Story = {
  render: () => <BareDropdown />,
};
