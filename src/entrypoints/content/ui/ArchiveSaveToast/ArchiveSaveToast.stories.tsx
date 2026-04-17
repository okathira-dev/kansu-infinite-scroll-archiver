import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/ui/button";
import { SAVE_SUMMARY_EVENT_NAME, type SaveSummaryEventDetail } from "@/lib/messages/systemEvents";
import { resolveServiceNotificationSettings } from "@/lib/types";
import { ArchiveSaveToastLayer, showArchiveSaveToast } from "./index";

const meta = {
  component: ArchiveSaveToastLayer,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ArchiveSaveToastLayer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Content 側イベント購読を通して件数トーストを確認する。 */
export const EventDriven: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ArchiveSaveToastLayer />
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent<SaveSummaryEventDetail>(SAVE_SUMMARY_EVENT_NAME, {
                detail: createMockDetail({ processed: 3, totalSaved: 24 }),
              }),
            )
          }
        >
          イベントで保存トースト
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent<SaveSummaryEventDetail>(SAVE_SUMMARY_EVENT_NAME, {
                detail: createMockDetail({
                  processed: 5,
                  totalSaved: 120,
                  toast: { showIncrementCount: true },
                }),
              }),
            )
          }
        >
          +件数あり
        </Button>
      </div>
    </div>
  ),
};

/** ロジック関数を直接呼び出すデバッグ用ストーリー。 */
export const DirectCall: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ArchiveSaveToastLayer />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => showArchiveSaveToast(createMockDetail({ totalSaved: 10 }))}>
          関数呼び出し（標準）
        </Button>
        <Button
          variant="outline"
          onClick={() => showArchiveSaveToast(createMockDetail({ toast: { enabled: false } }))}
        >
          トースト無効（表示なし）
        </Button>
      </div>
    </div>
  ),
};

function createMockDetail(
  overrides: Partial<{
    processed: number;
    totalSaved: number;
    toast: Partial<SaveSummaryEventDetail["notificationSettings"]["toast"]>;
  }> = {},
): SaveSummaryEventDetail {
  const base = resolveServiceNotificationSettings(undefined);
  return {
    serviceId: "service-demo",
    processed: overrides.processed ?? 1,
    created: 1,
    updated: 0,
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
