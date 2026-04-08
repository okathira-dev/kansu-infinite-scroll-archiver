import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog, DialogOverlay, DialogPortal } from "../index";

// 本番では DialogContent が Portal とオーバーレイを内包する。ここは低レベル検証用。

const meta = {
  component: DialogOverlay,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof DialogOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Dialog open>
      <DialogPortal>
        <DialogOverlay {...args} />
        <div className="fixed top-[50%] left-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-4 shadow-lg">
          <p className="text-sm">オーバーレイの className などを Controls で確認できます。</p>
        </div>
      </DialogPortal>
    </Dialog>
  ),
};
