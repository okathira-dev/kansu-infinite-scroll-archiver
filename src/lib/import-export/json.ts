/**
 * インポート/エクスポート用の JSON I/O とファイル名整形。
 *
 * 信頼できないファイル内容は `parseImportJsonText` 経由で `validateImportPayload` へ渡し、
 * 検証成功後のみ `ImportPayload` として扱う（`FR-41` / `NFR-23`）。
 */
import type { ExportPayload, ImportPayload, ValidationResult } from "@/lib/types";
import { validateImportPayload } from "@/lib/types";

const fallbackFileNamePart = "kansu-service";

/** ダウンロード時のファイル名にパス区切り等が混ざらないよう、安全な断片に落とす。 */
const sanitizeFileNamePart = (value: string): string => {
  const sanitized = value.trim().replace(/[^a-zA-Z0-9_-]+/g, "-");
  return sanitized.length > 0 ? sanitized : fallbackFileNamePart;
};

/** エクスポート payload を JSON 文字列へ整形する。 */
export const stringifyExportPayload = (payload: ExportPayload): string => {
  return JSON.stringify(payload, null, 2);
};

/**
 * ユーザーが保存する JSON のファイル名を組み立てる。
 * `download` 属性はブラウザが解釈するが、ホスト OS 向けに危険な文字を事前に除く。
 */
export const createExportFileName = (serviceId: string, exportedAt: string): string => {
  const safeServiceId = sanitizeFileNamePart(serviceId);
  const safeTimestamp = sanitizeFileNamePart(exportedAt.replace(/\.[0-9]{3}Z$/, "Z"));
  return `kansu-${safeServiceId}-${safeTimestamp}.json`;
};

/**
 * JSON テキストを `ImportPayload` として検証付きでパースする。
 *
 * `JSON.parse` の戻りは型が付かないため `unknown` に寄せ、検証レイヤで構造を確定する。
 */
export const parseImportJsonText = (jsonText: string): ValidationResult<ImportPayload> => {
  if (jsonText.trim().length === 0) {
    return {
      ok: false,
      errors: [{ field: "importFile", message: "must not be empty" }],
    };
  }

  try {
    // `as unknown`: 信頼前データを検証関数へ渡すための型境界。`as ImportPayload` は禁止。
    const parsed = JSON.parse(jsonText) as unknown;
    return validateImportPayload(parsed);
  } catch {
    return {
      ok: false,
      errors: [{ field: "importFile", message: "must be a valid JSON" }],
    };
  }
};

/** Blob + 一時 `<a download>` でローカル保存する（外部送信なし）。 */
export const downloadJsonText = (fileName: string, jsonText: string): void => {
  const blob = new Blob([jsonText], { type: "application/json" });
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(blobUrl);
};
