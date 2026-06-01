import type { Meta, StoryObj } from "@storybook/react";
import { LoadingState, ErrorState, EmptyState } from "./StateViews";

const meta: Meta = { title: "Organisms/StateViews" };
export default meta;
type Story = StoryObj;

export const Loading: Story = { render: () => <LoadingState /> };
export const Error: Story = { render: () => <ErrorState /> };
export const Empty: Story = { render: () => <EmptyState /> };
