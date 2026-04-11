import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { PaginationControls } from "./index";

const meta = {
  component: PaginationControls,
  parameters: {
    layout: "centered",
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

export const Default: Story = {
  render: () => {
    const [args, updateArgs] = useArgs<typeof meta.args>();

    return (
      <div className="w-[560px] rounded-md border bg-card p-4">
        <PaginationControls
          page={args?.page ?? 2}
          pageSize={args?.pageSize ?? 10}
          total={args?.total ?? 55}
          onPageChange={(p) => {
            updateArgs({ page: p });
          }}
        />
      </div>
    );
  },
};

export const FirstPage: Story = {
  args: {
    page: 1,
    total: 55,
  },
  render: (args) => (
    <div className="w-[560px] rounded-md border bg-card p-4">
      <PaginationControls
        page={args.page}
        pageSize={args.pageSize}
        total={args.total}
        onPageChange={args.onPageChange}
      />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    page: 1,
    total: 0,
  },
  render: (args) => (
    <div className="w-[560px] rounded-md border bg-card p-4">
      <PaginationControls
        page={args.page}
        pageSize={args.pageSize}
        total={args.total}
        onPageChange={args.onPageChange}
      />
    </div>
  ),
};
