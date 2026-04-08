import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious } from "../index";

const meta = {
  component: PaginationPrevious,
  parameters: {
    layout: "centered",
  },
  args: {
    href: "#",
  },
} satisfies Meta<typeof PaginationPrevious>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious {...args} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};
