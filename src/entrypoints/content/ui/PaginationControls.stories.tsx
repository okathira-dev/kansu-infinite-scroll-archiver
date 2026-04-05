import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PaginationControls } from "./PaginationControls";

const meta = {
  title: "Content/PaginationControls",
  component: PaginationControls,
  parameters: {
    layout: "centered",
  },
  args: {
    page: 1,
    pageSize: 10,
    total: 0,
    onPageChange: () => undefined,
  },
} satisfies Meta<typeof PaginationControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(2);
    return (
      <div className="w-[560px] rounded-md border bg-card p-4">
        <PaginationControls page={page} pageSize={10} total={55} onPageChange={setPage} />
      </div>
    );
  },
};

export const FirstPage: Story = {
  render: () => (
    <div className="w-[560px] rounded-md border bg-card p-4">
      <PaginationControls page={1} pageSize={10} total={55} onPageChange={() => undefined} />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="w-[560px] rounded-md border bg-card p-4">
      <PaginationControls page={1} pageSize={10} total={0} onPageChange={() => undefined} />
    </div>
  ),
};
