import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useArgs } from "storybook/preview-api";
import { PaginationControls } from "./index";

type PaginationControlsStoryProps = ComponentProps<typeof PaginationControls>;

const meta = {
  component: PaginationControls,
  decorators: [
    (Story) => (
      <div className="w-[560px] rounded-md border bg-card p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
    controls: {
      exclude: /^on[A-Z].*/,
    },
  },
  args: {
    page: 2,
    total: 55,
    pageSize: 10,
    onPageChange: () => undefined,
  },
} satisfies Meta<typeof PaginationControls>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderWithUseArgs = () => {
  const [args, updateArgs] = useArgs<PaginationControlsStoryProps>();

  return (
    <PaginationControls
      page={args.page}
      pageSize={args.pageSize}
      total={args.total}
      onPageChange={(p) => {
        updateArgs({ page: p });
      }}
    />
  );
};

export const Default: Story = {
  render: renderWithUseArgs,
};

export const FirstPage: Story = {
  args: {
    page: 1,
    total: 55,
  },
  render: renderWithUseArgs,
};

export const Empty: Story = {
  args: {
    page: 1,
    total: 0,
  },
  render: renderWithUseArgs,
};
