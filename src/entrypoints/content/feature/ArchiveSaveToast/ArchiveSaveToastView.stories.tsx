import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/ui/button";
import { notifySuccess } from "@/components/ui/Toaster";
import {
  ArchiveSaveToastView,
  ArchiveSaveToastViewport,
  buildArchiveSaveToastTitle,
} from "./ArchiveSaveToastView";

const meta = {
  component: ArchiveSaveToastView,
  parameters: {
    layout: "centered",
  },
  args: {
    serviceName: "デモサービス",
    totalSaved: 120,
    showIncrementCount: true,
    processed: 5,
    created: 2,
    updated: 3,
  },
} satisfies Meta<typeof ArchiveSaveToastView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** トースト本文 View を Controls で確認し、同じ内容を実際に表示する。 */
export const Default: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <ArchiveSaveToastViewport />
      <div className="rounded-md border bg-card p-4">
        <p className="mb-2 text-xs text-muted-foreground">プレビュー</p>
        <ArchiveSaveToastView {...args} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            notifySuccess(buildArchiveSaveToastTitle(args.serviceName), {
              description: <ArchiveSaveToastView {...args} />,
            })
          }
        >
          この内容でトースト表示
        </Button>
      </div>
    </div>
  ),
};

export const TotalOnly: Story = {
  args: {
    showIncrementCount: false,
  },
};
