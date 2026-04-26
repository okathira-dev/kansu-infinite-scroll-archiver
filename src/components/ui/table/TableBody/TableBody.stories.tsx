import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../index";

const meta = {
  component: TableBody,
  parameters: {
    layout: "centered",
  },
  args: {
    className: "",
    children: (
      <>
        <TableRow>
          <TableCell>セル 1-A</TableCell>
          <TableCell>セル 1-B</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>セル 2-A</TableCell>
          <TableCell>セル 2-B</TableCell>
        </TableRow>
      </>
    ),
  },
} satisfies Meta<typeof TableBody>;

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
      <TableBody {...args}>{args.children}</TableBody>
    </Table>
  ),
};
