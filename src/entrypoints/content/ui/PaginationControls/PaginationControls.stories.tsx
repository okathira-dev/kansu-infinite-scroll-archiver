import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useArgs } from "storybook/preview-api";
import { PaginationControls } from "./index";

type PaginationControlsStoryProps = ComponentProps<typeof PaginationControls> & {
  containerClassName: string;
};

function PaginationControlsStory({ containerClassName, ...props }: PaginationControlsStoryProps) {
  return (
    <div className={containerClassName}>
      <PaginationControls {...props} />
    </div>
  );
}

const meta = {
  component: PaginationControlsStory,
  parameters: {
    layout: "centered",
  },
  args: {
    containerClassName: "w-[560px] rounded-md border bg-card p-4",
    page: 2,
    total: 55,
    pageSize: 10,
    onPageChange: () => undefined,
  },
} satisfies Meta<typeof PaginationControlsStory>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderWithUseArgs = () => {
  const [args, updateArgs] = useArgs<PaginationControlsStoryProps>();

  return (
    <PaginationControlsStory
      containerClassName={args.containerClassName}
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
