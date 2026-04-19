import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useArgs } from "storybook/preview-api";
import { PopupAppView } from "./PopupAppView";

type PopupAppViewStoryArgs = ComponentProps<typeof PopupAppView>;

const meta = {
  component: PopupAppView,
  parameters: {
    layout: "centered",
  },
  args: {
    status: "待機中",
    isSubmitting: false,
    onToggleMainUi: () => undefined,
    onOpenOptions: () => undefined,
  },
} satisfies Meta<typeof PopupAppView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Popup の表示を Controls で確認する。 */
export const Default: Story = {
  render: () => {
    const [args, updateArgs] = useArgs<PopupAppViewStoryArgs>();
    return (
      <PopupAppView
        status={args?.status ?? "待機中"}
        isSubmitting={args?.isSubmitting ?? false}
        onToggleMainUi={() => {
          if (args?.isSubmitting) {
            return;
          }
          updateArgs({ status: "メインUIの表示切替を送信しました" });
        }}
        onOpenOptions={() => {
          updateArgs({ status: "Optionsページを開きました" });
        }}
      />
    );
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
    status: "メインUIの切替を送信中...",
  },
};
