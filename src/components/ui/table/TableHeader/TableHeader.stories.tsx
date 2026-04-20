import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table, TableHead, TableHeader, TableRow } from "../index";

const meta = {
  component: TableHeader,
  parameters: {
    layout: "centered",
  },
  args: {
    className: "",
    children: (
      <TableRow>
        <TableHead>列A</TableHead>
        <TableHead>列B</TableHead>
      </TableRow>
    ),
  },
} satisfies Meta<typeof TableHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Table className="w-[480px]">
      <TableHeader {...args}>{args.children}</TableHeader>
    </Table>
  ),
};
