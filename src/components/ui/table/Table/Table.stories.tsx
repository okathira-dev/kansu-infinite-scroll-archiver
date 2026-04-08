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
  component: Table,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[640px]">
      <Table>
        <TableCaption>抽出レコード一覧</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>タイトル</TableHead>
            <TableHead>更新日</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>rec-001</TableCell>
            <TableCell>無限スクロール記事 A</TableCell>
            <TableCell>2026-04-05</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>rec-002</TableCell>
            <TableCell>無限スクロール記事 B</TableCell>
            <TableCell>2026-04-04</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};
