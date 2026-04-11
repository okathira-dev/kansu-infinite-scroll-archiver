/**
 * Background の `ResponseError`（英語 `message`）を Options のトースト向け日本語へ変換する。
 *
 * メッセージ契約の `code` / `details` は変えず、UI 層だけで読み替える（`FR-32`）。
 */
import type { ResponseError } from "@/lib/messages";
import type { ValidationIssue } from "@/lib/types";
import { SUPPORTED_SCHEMA_VERSION } from "./schemaVersion";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isValidationIssue = (value: unknown): value is ValidationIssue => {
  if (!isRecord(value)) {
    return false;
  }
  return typeof value.field === "string" && typeof value.message === "string";
};

const isResponseError = (value: unknown): value is ResponseError => {
  if (!isRecord(value)) {
    return false;
  }
  return typeof value.code === "string" && typeof value.message === "string";
};

const summarizeFirstIssue = (issues: ValidationIssue[]): string => {
  const first = issues[0];
  if (!first) {
    return "入力値を確認してください。";
  }
  return `${first.field}: ${first.message}`;
};

const extractValidationIssues = (details: unknown): ValidationIssue[] => {
  if (!Array.isArray(details)) {
    return [];
  }
  return details.filter(isValidationIssue);
};

/** ValidationIssue 配列を簡潔な日本語メッセージに整形する。 */
export const getValidationIssueMessage = (issues: ValidationIssue[]): string => {
  return `入力値が不正です（${summarizeFirstIssue(issues)}）`;
};

/** ResponseError / 例外を Options 向けの日本語メッセージへ変換する。 */
export const getImportExportErrorMessage = (error: unknown): string => {
  if (isResponseError(error)) {
    switch (error.code) {
      // `MessageRouter.handleRaw` が schema 不一致専用に返すコード（import-export と揃える）
      case "UNSUPPORTED_SCHEMA_VERSION":
        return `schemaVersion が未対応です（対応: ${SUPPORTED_SCHEMA_VERSION}）。`;
      case "SERVICE_NOT_FOUND":
        return "対象サービスが見つかりません。設定一覧を更新して再試行してください。";
      case "VALIDATION_ERROR": {
        const issues = extractValidationIssues(error.details);
        if (issues.length > 0) {
          return getValidationIssueMessage(issues);
        }
        return "入力値が不正です。インポートファイルの内容を確認してください。";
      }
      case "INTERNAL_ERROR":
        return "内部エラーが発生しました。しばらくしてから再試行してください。";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "不明なエラーが発生しました。";
};
