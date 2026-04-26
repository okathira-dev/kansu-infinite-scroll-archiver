import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../index";

const meta = {
  component: DialogHeader,
  parameters: {
    layout: "centered",
  },
  args: {
    className: "gap-2",
    children: (
      <>
        <DialogTitle>タイトル</DialogTitle>
        <DialogDescription>ヘッダー領域のレイアウト用コンポーネントです。</DialogDescription>
      </>
    ),
  },
} satisfies Meta<typeof DialogHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Dialog defaultOpen>
      <DialogContent showCloseButton={false}>
        <DialogHeader {...args}>{args.children}</DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};
