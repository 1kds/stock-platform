import type { Meta, StoryObj } from "@storybook/react";
import { SearchInput } from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Molecules/SearchInput",
  component: SearchInput,
  args: { placeholder: "종목명 · 코드 검색" },
};
export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {};
