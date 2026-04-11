import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../index";

const meta = {
  component: DialogTitle,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "ダイアログタイトル",
  },
} satisfies Meta<typeof DialogTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Dialog defaultOpen>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle {...args} />
          <DialogDescription>
            タイトルに付随する説明です。Controls では主にタイトル側を変更します。
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};
