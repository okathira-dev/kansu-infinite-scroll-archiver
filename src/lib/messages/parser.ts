/**
 * `chrome.runtime` 等で受け取った生のメッセージをパースし、型付き `RequestMessage` に正規化する。
 *
 * 検証失敗時は `ValidationResult` の `errors` を返す。フィールド名は `message.payload.*` 形式に正規化し、
 * Background が `VALIDATION_ERROR` の `details` としてそのまま渡しやすくする。
 */
import {
  type ValidationResult,
  validateBulkUpsertPayload,
  validateConfigDeletePayload,
  validateExportPayload,
  validateImportPayload,
  validateRecordCountByServicePayload,
  validateSearchQuery,
  validateServiceConfig,
} from "@/lib/types";
import type { RequestMessage } from "./contracts";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const messageError = (field: string, message: string): ValidationResult<RequestMessage> => ({
  ok: false,
  errors: [{ field, message }],
});

/**
 * 未知の `type` はここで弾き、既知の型は種別ごとのバリデータに委譲する。
 *
 * @param input - `sendMessage` で渡されたオブジェクト（想定外プロパティがあっても無視）
 */
export const parseRequestMessage = (input: unknown): ValidationResult<RequestMessage> => {
  if (!isRecord(input)) {
    return messageError("message", "must be an object");
  }

  if (typeof input.type !== "string") {
    return messageError("message.type", "must be a string");
  }

  switch (input.type) {
    case "configs/list":
      return { ok: true, data: { type: "configs/list" } };
    case "configs/save": {
      const result = validateServiceConfig(input.payload);
      if (!result.ok) {
        return {
          ok: false,
          errors: result.errors.map((error) => ({
            field: `message.payload.${error.field}`,
            message: error.message,
          })),
        };
      }
      return { ok: true, data: { type: "configs/save", payload: result.data } };
    }
    case "configs/delete": {
      const result = validateConfigDeletePayload(input.payload);
      if (!result.ok) {
        return {
          ok: false,
          errors: result.errors.map((error) => ({
            field: `message.payload.${error.field}`,
            message: error.message,
          })),
        };
      }
      return { ok: true, data: { type: "configs/delete", payload: result.data } };
    }
    case "records/bulkUpsert": {
      const result = validateBulkUpsertPayload(input.payload);
      if (!result.ok) {
        return {
          ok: false,
          errors: result.errors.map((error) => ({
            field: `message.payload.${error.field}`,
            message: error.message,
          })),
        };
      }
      return { ok: true, data: { type: "records/bulkUpsert", payload: result.data } };
    }
    case "records/search": {
      const result = validateSearchQuery(input.payload);
      if (!result.ok) {
        return {
          ok: false,
          errors: result.errors.map((error) => ({
            field: `message.payload.${error.field}`,
            message: error.message,
          })),
        };
      }
      return { ok: true, data: { type: "records/search", payload: result.data } };
    }
    case "records/countByServiceId": {
      const result = validateRecordCountByServicePayload(input.payload);
      if (!result.ok) {
        return {
          ok: false,
          errors: result.errors.map((error) => ({
            field: `message.payload.${error.field}`,
            message: error.message,
          })),
        };
      }
      return { ok: true, data: { type: "records/countByServiceId", payload: result.data } };
    }
    case "records/countsByService":
      return { ok: true, data: { type: "records/countsByService" } };
    case "data/export": {
      const result = validateExportPayload(input.payload);
      if (!result.ok) {
        return {
          ok: false,
          errors: result.errors.map((error) => ({
            field: `message.payload.${error.field}`,
            message: error.message,
          })),
        };
      }
      return { ok: true, data: { type: "data/export", payload: result.data } };
    }
    case "data/import": {
      // UI 側でも検証するが、任意の送信元を想定し Background 入口で必ず弾く（`NFR-23`）
      const result = validateImportPayload(input.payload);
      if (!result.ok) {
        return {
          ok: false,
          errors: result.errors.map((error) => ({
            field: `message.payload.${error.field}`,
            message: error.message,
          })),
        };
      }
      return { ok: true, data: { type: "data/import", payload: result.data } };
    }
    default:
      return messageError("message.type", `unsupported type: ${input.type}`);
  }
};
