import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from "../index";

const meta = {
  component: PaginationEllipsis,
  parameters: {
    layout: "centered",
  },
  args: {
    className: "",
  },
} satisfies Meta<typeof PaginationEllipsis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationEllipsis {...args} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};
