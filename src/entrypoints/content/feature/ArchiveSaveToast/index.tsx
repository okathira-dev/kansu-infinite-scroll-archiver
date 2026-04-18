import { useEffect } from "react";
import { notifySuccess } from "@/components/ui/Toaster";
import { SAVE_SUMMARY_EVENT_NAME, type SaveSummaryEventDetail } from "@/lib/messages/systemEvents";
import {
  ArchiveSaveToastView,
  ArchiveSaveToastViewport,
  buildArchiveSaveToastTitle,
} from "../../ui/ArchiveSaveToast";
import { isSaveSummaryNumericFields } from "./saveSummaryNumericFields";

/** `CustomEvent` の detail が保存サマリかどうかを判定する。 */
export const isArchiveSaveToastDetail = (value: unknown): value is SaveSummaryEventDetail => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.serviceId !== "string") {
    return false;
  }
  if (typeof record.serviceName !== "string") {
    return false;
  }
  if (!isSaveSummaryNumericFields(value)) {
    return false;
  }
  if (typeof record.notificationSettings !== "object" || record.notificationSettings === null) {
    return false;
  }
  return true;
};

/** 保存サマリを View 設定に従ってトースト表示する。 */
export const showArchiveSaveToast = (detail: SaveSummaryEventDetail): void => {
  if (!detail.notificationSettings.toast.enabled) {
    return;
  }

  const uiProps = {
    serviceName: detail.serviceName,
    totalSaved: detail.totalSaved,
    showIncrementCount: detail.notificationSettings.toast.showIncrementCount,
    processed: detail.processed,
    created: detail.created,
    updated: detail.updated,
  };
  notifySuccess(buildArchiveSaveToastTitle(uiProps.serviceName), {
    description: <ArchiveSaveToastView {...uiProps} />,
  });
};

/**
 * Content Script で保存サマリイベントを購読し、件数トーストを表示するレイヤー。
 *
 * `SAVE_SUMMARY_EVENT_NAME` を購読するドメイン知識は content 側に閉じる。
 */
export function ArchiveSaveToast() {
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

  return <ArchiveSaveToastViewport />;
}
