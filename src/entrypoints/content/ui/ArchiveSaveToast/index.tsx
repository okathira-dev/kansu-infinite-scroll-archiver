import { useEffect } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/toast";
import { SAVE_SUMMARY_EVENT_NAME, type SaveSummaryEventDetail } from "@/lib/messages/systemEvents";

/** `CustomEvent` の detail が保存サマリかどうかを判定する。 */
export const isArchiveSaveToastDetail = (value: unknown): value is SaveSummaryEventDetail =>
  typeof value === "object" &&
  value !== null &&
  "serviceId" in value &&
  typeof value.serviceId === "string" &&
  "processed" in value &&
  typeof value.processed === "number" &&
  "totalSaved" in value &&
  typeof value.totalSaved === "number" &&
  "notificationSettings" in value &&
  typeof value.notificationSettings === "object" &&
  value.notificationSettings !== null;

/** 保存サマリを UI 設定に従ってトースト表示する。 */
export const showArchiveSaveToast = (detail: SaveSummaryEventDetail): void => {
  if (!detail.notificationSettings.toast.enabled) {
    return;
  }

  const extraDetails: string[] = [];
  if (detail.notificationSettings.toast.showIncrementCount) {
    extraDetails.push(`+${detail.processed}件`);
  }
  const description = [`合計 ${detail.totalSaved} 件`, ...extraDetails].join(" / ");
  toast.success("アーカイブを保存しました", { description });
};

/**
 * Content Script で保存サマリイベントを購読し、件数トーストを表示するレイヤー。
 *
 * `SAVE_SUMMARY_EVENT_NAME` を購読するドメイン知識は content 側に閉じる。
 */
export function ArchiveSaveToastLayer() {
  useEffect(() => {
    const handleSaveSummary = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      if (!isArchiveSaveToastDetail(detail)) {
        return;
      }
      showArchiveSaveToast(detail);
    };
    window.addEventListener(SAVE_SUMMARY_EVENT_NAME, handleSaveSummary as EventListener);
    return () =>
      window.removeEventListener(SAVE_SUMMARY_EVENT_NAME, handleSaveSummary as EventListener);
  }, []);

  return <Toaster richColors closeButton />;
}
