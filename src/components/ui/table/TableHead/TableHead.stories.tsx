import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table, TableHead, TableHeader, TableRow } from "../index";

const meta = {
  component: TableHead,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "見出しセル",
    className: "",
  },
} satisfies Meta<typeof TableHead>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Table className="w-[480px]">
      <TableHeader>
        <TableRow>
          <TableHead {...args} />
        </TableRow>
      </TableHeader>
    </Table>
  ),
};
