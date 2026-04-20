import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog, DialogOverlay, DialogPortal } from "../index";

// 本番では DialogContent が Portal とオーバーレイを内包する。ここは低レベル検証用。

const meta = {
  component: DialogPortal,
  parameters: {
    layout: "centered",
  },
  args: {
    children: (
      <>
        <DialogOverlay />
        <div className="fixed top-[50%] left-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-4 shadow-lg">
          <p className="text-sm">Portal 内のデモ領域（オーバーレイの手前）</p>
        </div>
      </>
    ),
  },
} satisfies Meta<typeof DialogPortal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Dialog open>
      <DialogPortal {...args}>{args.children}</DialogPortal>
    </Dialog>
  ),
};
