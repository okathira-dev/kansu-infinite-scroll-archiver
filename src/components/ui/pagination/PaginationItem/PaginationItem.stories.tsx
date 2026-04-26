import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination, PaginationContent, PaginationItem } from "../index";

const meta = {
  component: PaginationItem,
  parameters: {
    layout: "centered",
  },
  args: {
    children: <span>主役のページ項目</span>,
  },
} satisfies Meta<typeof PaginationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem {...args}>{args.children}</PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};
