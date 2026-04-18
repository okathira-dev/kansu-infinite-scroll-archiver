import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { Button } from "../button";
import { notifyError, notifyInfo, notifySuccess, notifyWarning, Toaster } from "./index";

type ToastKind = "success" | "info" | "warning" | "error";
type ToastStoryArgs = ComponentProps<typeof Toaster> & {
  previewKind: ToastKind;
  previewTitle: string;
  previewDescription: string;
};

const showPreviewToast = ({ previewKind, previewTitle, previewDescription }: ToastStoryArgs) => {
  const detail = previewDescription.trim();
  const options = detail.length > 0 ? { description: detail } : undefined;
  switch (previewKind) {
    case "success":
      notifySuccess(previewTitle, options);
      return;
    case "info":
      notifyInfo(previewTitle, options);
      return;
    case "warning":
      notifyWarning(previewTitle, options);
      return;
    case "error":
      notifyError(previewTitle, options);
      return;
  }
};

function ToasterPreview({
  previewKind,
  previewTitle,
  previewDescription,
  ...toasterProps
}: ToastStoryArgs) {
  return (
    <div className="flex flex-col gap-4">
      <Toaster {...toasterProps} />
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            showPreviewToast({ previewKind, previewTitle, previewDescription, ...toasterProps })
          }
        >
          この内容で表示
        </Button>
      </div>
    </div>
  );
}

const meta = {
  component: ToasterPreview,
  parameters: {
    layout: "centered",
  },
  args: {
    richColors: true,
    closeButton: true,
    previewKind: "success",
    previewTitle: "保存しました",
    previewDescription: "3件を保存しました",
  },
  argTypes: {
    previewKind: {
      control: "radio",
      options: ["success", "info", "warning", "error"],
    },
    previewTitle: {
      control: "text",
    },
    previewDescription: {
      control: "text",
    },
  },
} satisfies Meta<typeof ToasterPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controls でトースト内容を調整して確認する。 */
export const ToasterControls: Story = {
  render: (args) => <ToasterPreview {...args} />,
};

/** 種別ごとの表示例を固定文言で確認する。 */
export const PresetExamples: Story = {
  argTypes: {
    previewKind: { table: { disable: true } },
    previewTitle: { table: { disable: true } },
    previewDescription: { table: { disable: true } },
  },
  render: (args) => {
    const { previewKind, previewTitle, previewDescription, ...toasterProps } = args;
    return (
      <div className="flex flex-col gap-4">
        <Toaster {...toasterProps} />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => notifySuccess("保存しました", { description: "Success プリセット" })}
          >
            Success
          </Button>
          <Button variant="secondary" onClick={() => notifyInfo("情報メッセージです")}>
            Info
          </Button>
          <Button variant="secondary" onClick={() => notifyWarning("確認が必要です")}>
            Warning
          </Button>
          <Button variant="destructive" onClick={() => notifyError("エラーが発生しました")}>
            Error
          </Button>
        </div>
      </div>
    );
  },
};
