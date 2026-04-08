import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table, TableBody, TableCell, TableRow } from "../index";

const meta = {
  component: TableCell,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "データセル",
    className: "",
  },
} satisfies Meta<typeof TableCell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Table className="w-[480px]">
      <TableBody>
        <TableRow>
          <TableCell {...args} />
          <TableCell>隣のセル</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
