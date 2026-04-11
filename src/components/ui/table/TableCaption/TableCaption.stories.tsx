import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../index";

const meta = {
  component: TableCaption,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "テーブルのキャプション（概要説明）",
    className: "",
  },
} satisfies Meta<typeof TableCaption>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Table className="w-[480px]">
      <TableCaption {...args} />
      <TableHeader>
        <TableRow>
          <TableHead>列</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>値</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
