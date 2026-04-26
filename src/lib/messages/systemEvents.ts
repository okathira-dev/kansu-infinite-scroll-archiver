import type { ServiceNotificationSettings } from "@/lib/types";

/** Content Script へ設定更新を通知するイベント種別。 */
export const CONFIGS_UPDATED_MESSAGE_TYPE = "kansu/configsUpdated" as const;

/** 設定更新通知メッセージ。 */
export interface ConfigsUpdatedMessage {
  type: typeof CONFIGS_UPDATED_MESSAGE_TYPE;
}

/** `unknown` から設定更新通知かどうかを判定する。 */
export const isConfigsUpdatedMessage = (value: unknown): value is ConfigsUpdatedMessage =>
  typeof value === "object" &&
  value !== null &&
  "type" in value &&
  value.type === CONFIGS_UPDATED_MESSAGE_TYPE;

/** Content Script が監視状態を Background へ通知するメッセージ種別。 */
export const MONITORING_STATE_MESSAGE_TYPE = "kansu/monitoringState" as const;

export interface MonitoringStateMessage {
  type: typeof MONITORING_STATE_MESSAGE_TYPE;
  payload: {
    active: boolean;
    serviceId: string;
    notificationSettings: ServiceNotificationSettings;
    /** IndexedDB に既に保存されている当該サービスの件数（リロード後も維持）。未指定時は 0。 */
    persistedRecordCount?: number;
  };
}

/** `unknown` から監視状態通知メッセージを判定する。 */
export const isMonitoringStateMessage = (value: unknown): value is MonitoringStateMessage => {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return false;
  }
  if (value.type !== MONITORING_STATE_MESSAGE_TYPE || !("payload" in value)) {
    return false;
  }
  const payload = value.payload;
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("active" in payload) ||
    typeof payload.active !== "boolean" ||
    !("serviceId" in payload) ||
    typeof payload.serviceId !== "string"
  ) {
    return false;
  }
  if (
    "persistedRecordCount" in payload &&
    payload.persistedRecordCount !== undefined &&
    (typeof payload.persistedRecordCount !== "number" ||
      !Number.isFinite(payload.persistedRecordCount) ||
      payload.persistedRecordCount < 0)
  ) {
    return false;
  }
  return true;
};

/** 保存サマリを Content 内で伝播する CustomEvent 名。 */
export const SAVE_SUMMARY_EVENT_NAME = "kansu:save-summary" as const;

/** 保存サマリイベントの詳細。 */
export interface SaveSummaryEventDetail {
  serviceId: string;
  /** 設定 UI に表示しているサービス名（`ServiceConfig.name`）。 */
  serviceName: string;
  processed: number;
  created: number;
  updated: number;
  totalSaved: number;
  notificationSettings: ServiceNotificationSettings;
}
