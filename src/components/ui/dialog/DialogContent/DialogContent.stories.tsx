import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../index";

const meta = {
  component: DialogContent,
  parameters: {
    layout: "centered",
  },
  args: {
    showCloseButton: true,
    children: "本文テキスト。showCloseButton や className を Controls から変えられます。",
  },
} satisfies Meta<typeof DialogContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const { children, ...contentProps } = args;
    return (
      <Dialog defaultOpen>
        <DialogContent {...contentProps}>
          <DialogTitle>ダイアログ</DialogTitle>
          <DialogDescription>
            プレビュー用。本文は Controls の children で変更できます。
          </DialogDescription>
          {children}
        </DialogContent>
      </Dialog>
    );
  },
};
