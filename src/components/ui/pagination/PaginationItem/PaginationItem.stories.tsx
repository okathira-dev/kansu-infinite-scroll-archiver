import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "../index";

const meta = {
  component: PaginationItem,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof PaginationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem {...args}>
          <PaginationLink href="#">主役のページ項目</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};
