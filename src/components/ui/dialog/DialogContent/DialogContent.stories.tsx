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
    children: (
      <>
        <DialogTitle>ダイアログ</DialogTitle>
        <DialogDescription>
          プレビュー用。本文は Controls の children で変更できます。
        </DialogDescription>
        本文テキスト。showCloseButton や className を Controls から変えられます。
      </>
    ),
  },
} satisfies Meta<typeof DialogContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const { children, ...contentProps } = args;
    return (
      <Dialog defaultOpen>
        <DialogContent {...contentProps}>{children}</DialogContent>
      </Dialog>
    );
  },
};

/** `disableOutsideDismiss`: オーバーレイや外側クリックでは閉じない（`onInteractOutside` で `preventDefault`）。 */
export const DisableOutsideDismiss: Story = {
  args: {
    disableOutsideDismiss: true,
    children: (
      <>
        <DialogTitle>外側クリックでは閉じない</DialogTitle>
        <DialogDescription>
          オーバーレイをクリックしても閉じません。閉じる操作は × ボタンや Esc キー（Radix
          既定）を利用してください。
        </DialogDescription>
        外側クリック無効の確認用コンテンツです。
      </>
    ),
  },
  render: (args) => {
    const { children, ...contentProps } = args;
    return (
      <Dialog defaultOpen>
        <DialogContent {...contentProps}>{children}</DialogContent>
      </Dialog>
    );
  },
};

/** `disablePortal`: Overlay と Content を呼び出し位置に直接描画する。 */
export const DisablePortal: Story = {
  args: {
    disablePortal: true,
    children: (
      <>
        <DialogTitle>Portal を使わない描画</DialogTitle>
        <DialogDescription>
          Portal を使わず、呼び出し位置へインライン描画して挙動を確認します。
        </DialogDescription>
        インライン描画確認用の本文です。
      </>
    ),
  },
  render: (args) => {
    const { children, ...contentProps } = args;
    return (
      <Dialog defaultOpen>
        <DialogContent {...contentProps}>{children}</DialogContent>
      </Dialog>
    );
  },
};
