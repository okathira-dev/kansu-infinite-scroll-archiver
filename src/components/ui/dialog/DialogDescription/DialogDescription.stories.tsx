import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../index";

const meta = {
  component: DialogDescription,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "説明文です。アクセシブルネームの補助として使われます。",
  },
} satisfies Meta<typeof DialogDescription>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Dialog defaultOpen>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>操作の確認</DialogTitle>
          <DialogDescription {...args} />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};
