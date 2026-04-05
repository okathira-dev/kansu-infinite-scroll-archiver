import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>ダイアログを開く</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>設定を保存しますか？</DialogTitle>
          <DialogDescription>
            保存すると現在の設定で次回以降の検索・抽出が実行されます。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <Button>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
