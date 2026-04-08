import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../index";

const meta = {
  component: DialogTrigger,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "ダイアログを開く",
  },
} satisfies Meta<typeof DialogTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Dialog>
      <DialogTrigger {...args} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>プレビュー</DialogTitle>
          <DialogDescription>
            ダイアログ本文の前にタイトルと説明を置く通常構成です。
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          トリガーの children や className を Controls で確認できます。
        </p>
      </DialogContent>
    </Dialog>
  ),
};
