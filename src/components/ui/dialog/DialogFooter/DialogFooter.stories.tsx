import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../index";

const meta = {
  component: DialogFooter,
  parameters: {
    layout: "centered",
  },
  args: {
    showCloseButton: false,
    className: "",
    children: (
      <>
        <Button type="button" variant="outline">
          キャンセル
        </Button>
        <Button type="button">OK</Button>
      </>
    ),
  },
} satisfies Meta<typeof DialogFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Dialog defaultOpen>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>確認</DialogTitle>
          <DialogDescription>フッターのアクション配置を確認するプレビューです。</DialogDescription>
        </DialogHeader>
        <DialogFooter {...args}>{args.children}</DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
