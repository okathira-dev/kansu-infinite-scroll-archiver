import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../index";

const meta = {
  component: DialogContent,
  parameters: {
    layout: "centered",
  },
  args: {
    showCloseButton: true,
    disablePortal: false,
    disableOutsideDismiss: false,
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

/** `disableOutsideDismiss`: オーバーレイや外側クリックでは閉じない（`onInteractOutside` で `preventDefault`）。 */
export const DisableOutsideDismiss: Story = {
  args: {
    disableOutsideDismiss: true,
  },
  render: (args) => {
    const { children, ...contentProps } = args;
    return (
      <Dialog defaultOpen>
        <DialogContent {...contentProps}>
          <DialogTitle>外側クリックでは閉じない</DialogTitle>
          <DialogDescription>
            オーバーレイをクリックしても閉じません。閉じる操作は × ボタンや Esc キー（Radix
            既定）を利用してください。
          </DialogDescription>
          {children}
        </DialogContent>
      </Dialog>
    );
  },
};

/** `disablePortal`: Overlay と Content を呼び出し位置に直接描画する。 */
export const DisablePortal: Story = {
  args: {
    disablePortal: true,
  },
  render: (args) => {
    const { children, ...contentProps } = args;
    return (
      <Dialog defaultOpen>
        <DialogContent {...contentProps}>
          <DialogTitle>Portal を使わない描画</DialogTitle>
          <DialogDescription>
            Portal を使わず、呼び出し位置へインライン描画して挙動を確認します。
          </DialogDescription>
          {children}
        </DialogContent>
      </Dialog>
    );
  },
};
