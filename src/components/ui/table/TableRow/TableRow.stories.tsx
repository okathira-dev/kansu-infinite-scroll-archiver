import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../index";

const meta = {
  component: TableRow,
  parameters: {
    layout: "centered",
  },
  args: {
    className: "",
    children: (
      <>
        <TableCell>主役の行・左</TableCell>
        <TableCell>主役の行・右</TableCell>
      </>
    ),
  },
} satisfies Meta<typeof TableRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Table className="w-[480px]">
      <TableHeader>
        <TableRow>
          <TableHead>列A</TableHead>
          <TableHead>列B</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow {...args}>{args.children}</TableRow>
        <TableRow>
          <TableCell>比較用</TableCell>
          <TableCell>比較用</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
