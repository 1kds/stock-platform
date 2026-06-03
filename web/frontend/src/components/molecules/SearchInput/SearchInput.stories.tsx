import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SearchInput } from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Molecules/SearchInput",
  component: SearchInput,
  args: { placeholder: "종목명 · 코드 검색" },
};
export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {};

function ControlledSearch() {
  const [value, setValue] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <SearchInput
        placeholder="종목명 · 코드 검색"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <span className="text-xs text-muted-foreground">입력값: {value || "(없음)"}</span>
    </div>
  );
}

/** controlled — value/onChange로 입력값을 상위에서 제어. */
export const Controlled: Story = {
  render: () => <ControlledSearch />,
};

/** a11y — placeholder 없이 aria-label로 접근 가능한 이름을 부여. */
export const WithAriaLabel: Story = {
  args: { placeholder: undefined, "aria-label": "종목 검색" },
};
