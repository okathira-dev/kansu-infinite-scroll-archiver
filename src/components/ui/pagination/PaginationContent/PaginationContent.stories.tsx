import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "../index";

const meta = {
  component: PaginationContent,
  parameters: {
    layout: "centered",
  },
  args: {
    className: "",
    children: (
      <>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
      </>
    ),
  },
} satisfies Meta<typeof PaginationContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Pagination>
      <PaginationContent {...args}>{args.children}</PaginationContent>
    </Pagination>
  ),
};
