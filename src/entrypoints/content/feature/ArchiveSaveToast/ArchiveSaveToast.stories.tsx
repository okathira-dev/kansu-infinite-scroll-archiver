import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/ui/button";
import { SAVE_SUMMARY_EVENT_NAME, type SaveSummaryEventDetail } from "@/lib/messages/systemEvents";
import { resolveServiceNotificationSettings } from "@/lib/types";
import { ArchiveSaveToast } from "./index";

const meta = {
  component: ArchiveSaveToast,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ArchiveSaveToast>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Content 側イベント購読を通して件数トーストを確認する。 */
export const EventDriven: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ArchiveSaveToast />
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent<SaveSummaryEventDetail>(SAVE_SUMMARY_EVENT_NAME, {
                detail: createMockDetail({
                  processed: 3,
                  created: 3,
                  updated: 0,
                  totalSaved: 24,
                }),
              }),
            )
          }
        >
          新規のみ
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent<SaveSummaryEventDetail>(SAVE_SUMMARY_EVENT_NAME, {
                detail: createMockDetail({
                  processed: 4,
                  created: 0,
                  updated: 4,
                  totalSaved: 100,
                }),
              }),
            )
          }
        >
          更新のみ
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent<SaveSummaryEventDetail>(SAVE_SUMMARY_EVENT_NAME, {
                detail: createMockDetail({
                  processed: 5,
                  created: 2,
                  updated: 3,
                  totalSaved: 120,
                  toast: { showIncrementCount: true },
                }),
              }),
            )
          }
        >
          新規+更新（内訳あり）
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent<SaveSummaryEventDetail>(SAVE_SUMMARY_EVENT_NAME, {
                detail: createMockDetail({
                  totalSaved: 50,
                  toast: { showIncrementCount: false },
                }),
              }),
            )
          }
        >
          合計のみ（内訳オフ）
        </Button>
      </div>
    </div>
  ),
};

function createMockDetail(
  overrides: Partial<{
    processed: number;
    created: number;
    updated: number;
    totalSaved: number;
    serviceName: string;
    toast: Partial<SaveSummaryEventDetail["notificationSettings"]["toast"]>;
  }> = {},
): SaveSummaryEventDetail {
  const base = resolveServiceNotificationSettings(undefined);
  const processed = overrides.processed ?? 1;
  const created = overrides.created ?? 1;
  const updated = overrides.updated ?? 0;
  return {
    serviceId: "service-demo",
    serviceName: overrides.serviceName ?? "デモサービス",
    processed,
    created,
    updated,
    totalSaved: overrides.totalSaved ?? 1,
    notificationSettings: {
      ...base,
      toast: {
        ...base.toast,
        ...overrides.toast,
      },
    },
  };
}
