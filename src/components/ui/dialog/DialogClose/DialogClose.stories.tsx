import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../index";

const meta = {
  component: DialogClose,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "閉じる",
  },
} satisfies Meta<typeof DialogClose>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Dialog defaultOpen>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>ダイアログ</DialogTitle>
          <DialogDescription>閉じる操作を確認するためのプレビューです。</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          閉じるボタンの見た目を Controls で調整できます。
        </p>
        <DialogClose {...args} />
      </DialogContent>
    </Dialog>
  ),
};
