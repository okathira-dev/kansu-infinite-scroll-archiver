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
