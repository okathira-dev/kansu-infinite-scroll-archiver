import type { ExportPayload, ImportPayload, SearchQuery, ServiceConfig } from "@/lib/types";

/**
 * 拡張内メッセージの要求側 discriminated union。
 *
 * `type` で分岐し、payload がある種別は実行時検証後にハンドラへ渡す（`parser.ts`）。
 */
export type RequestMessage =
  | { type: "records/bulkUpsert"; payload: { records: ExportPayload["records"] } }
  | { type: "records/search"; payload: SearchQuery }
  | { type: "configs/list" }
  | { type: "configs/save"; payload: ServiceConfig }
  | { type: "configs/delete"; payload: { id: string; deleteRecords?: boolean } }
  | { type: "data/export"; payload: { serviceId: string } }
  | { type: "data/import"; payload: ImportPayload };

/**
 * 呼び出し元へ返すエラー情報（NFR-11）。
 *
 * `details` には検証エラー配列やデバッグ用コンテキストを載せられる。シリアライズ可能な値に限定する。
 */
export interface ResponseError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * すべてのメッセージ応答で共通の Result 型。
 *
 * 成功時は `data`、失敗時は `error` のどちらか一方。
 */
export type ResponseMessage<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: ResponseError };

/** 成功レスポンスを組み立てる。 */
export const createSuccessResponse = <T>(data: T): ResponseMessage<T> => ({
  ok: true,
  data,
});

/**
 * 失敗レスポンスを組み立てる。
 *
 * @param code - 呼び出し側が分岐しやすい短い識別子（例: `VALIDATION_ERROR`）
 */
export const createErrorResponse = (
  code: string,
  message: string,
  details?: unknown,
): ResponseMessage<never> => ({
  ok: false,
  error: { code, message, details },
});
