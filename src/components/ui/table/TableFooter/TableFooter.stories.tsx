import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../index";

const meta = {
  component: TableFooter,
  parameters: {
    layout: "centered",
  },
  args: {
    className: "",
    children: (
      <TableRow>
        <TableCell colSpan={2}>フッター行（合計など）</TableCell>
      </TableRow>
    ),
  },
} satisfies Meta<typeof TableFooter>;

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
        <TableRow>
          <TableCell>データ 1</TableCell>
          <TableCell>データ 2</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter {...args}>{args.children}</TableFooter>
    </Table>
  ),
};
