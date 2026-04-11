import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination, PaginationContent, PaginationItem, PaginationNext } from "../index";

const meta = {
  component: PaginationNext,
  parameters: {
    layout: "centered",
  },
  args: {
    href: "#",
  },
} satisfies Meta<typeof PaginationNext>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationNext {...args} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};
