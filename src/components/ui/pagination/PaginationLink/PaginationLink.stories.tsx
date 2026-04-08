import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "../index";

const meta = {
  component: PaginationLink,
  parameters: {
    layout: "centered",
  },
  args: {
    href: "#",
    children: "1",
    isActive: false,
    size: "icon" as const,
  },
} satisfies Meta<typeof PaginationLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink {...args} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const Active: Story = {
  args: {
    isActive: true,
    children: "2",
  },
  render: (args) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink {...args} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};
