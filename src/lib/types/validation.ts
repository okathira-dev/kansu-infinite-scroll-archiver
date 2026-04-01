/**
 * メッセージ payload や保存前設定のランタイム検証。
 *
 * 外部（メッセージ・JSON）から入る `unknown` を扱うため、型アサーションではなくここで弾く。
 * エラーメッセージは英語のまま（`details` 用・デバッグ向け）。呼び出し側でユーザー向け文言にマップしてよい。
 */
import type {
  ExtractedRecord,
  FieldRule,
  FieldType,
  ImportPayload,
  SearchQuery,
  ServiceConfig,
  SortOrder,
} from "./domain";

/** 検証失敗 1 件。`field` はドット区切りでネストを表す。 */
export interface ValidationIssue {
  field: string;
  message: string;
}

/** 成功時はパース済み `data`、失敗時は集約した `errors`。 */
export type ValidationResult<T> = { ok: true; data: T } | { ok: false; errors: ValidationIssue[] };

/* --- 内部ヘルパー（プレーンオブジェクト・配列・文字列の段階的検証） --- */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asNonEmptyString = (
  value: unknown,
  field: string,
  issues: ValidationIssue[],
): string | null => {
  if (typeof value !== "string" || value.trim().length === 0) {
    issues.push({ field, message: "must be a non-empty string" });
    return null;
  }
  return value;
};

const asStringArray = (
  value: unknown,
  field: string,
  issues: ValidationIssue[],
): string[] | null => {
  if (!Array.isArray(value) || value.length === 0) {
    issues.push({ field, message: "must be a non-empty string array" });
    return null;
  }

  const values: string[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const item = value[index];
    if (typeof item !== "string" || item.trim().length === 0) {
      issues.push({ field: `${field}[${index}]`, message: "must be a non-empty string" });
    } else {
      values.push(item);
    }
  }
  return values;
};

const asStringRecord = (
  value: unknown,
  field: string,
  issues: ValidationIssue[],
): Record<string, string> | null => {
  if (!isRecord(value)) {
    issues.push({ field, message: "must be an object with string values" });
    return null;
  }

  const data: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== "string") {
      issues.push({ field: `${field}.${key}`, message: "must be a string" });
      continue;
    }
    data[key] = entry;
  }
  return data;
};

const isFieldType = (value: unknown): value is FieldType =>
  value === "text" || value === "linkUrl" || value === "imageUrl" || value === "regex";

const isSortOrder = (value: unknown): value is SortOrder => value === "asc" || value === "desc";

/**
 * 単一の `FieldRule` を検証する。
 * `regex` 型のときのみ `regex` プロパティを必須とし、`new RegExp` で構文チェックする。
 */
const parseFieldRule = (
  input: unknown,
  field: string,
  issues: ValidationIssue[],
): FieldRule | null => {
  if (!isRecord(input)) {
    issues.push({ field, message: "must be an object" });
    return null;
  }

  const name = asNonEmptyString(input.name, `${field}.name`, issues);
  const selector = asNonEmptyString(input.selector, `${field}.selector`, issues);

  if (!isFieldType(input.type)) {
    issues.push({
      field: `${field}.type`,
      message: "must be one of text/linkUrl/imageUrl/regex",
    });
  }

  let regex: string | undefined;
  if (input.type === "regex") {
    const regexValue = asNonEmptyString(input.regex, `${field}.regex`, issues);
    if (regexValue) {
      try {
        // 正規表現の構文エラーを早期検出する。
        new RegExp(regexValue);
        regex = regexValue;
      } catch {
        issues.push({ field: `${field}.regex`, message: "must be a valid regex pattern" });
      }
    }
  }

  if (!name || !selector || !isFieldType(input.type)) {
    return null;
  }

  return {
    name,
    selector,
    type: input.type,
    regex,
  };
};

/** 1 件の `ExtractedRecord` を検証する。`data` はすべて文字列値であること。 */
const parseExtractedRecord = (
  input: unknown,
  field: string,
  issues: ValidationIssue[],
): ExtractedRecord | null => {
  if (!isRecord(input)) {
    issues.push({ field, message: "must be an object" });
    return null;
  }

  const serviceId = asNonEmptyString(input.serviceId, `${field}.serviceId`, issues);
  const uniqueKey = asNonEmptyString(input.uniqueKey, `${field}.uniqueKey`, issues);
  const extractedAt = asNonEmptyString(input.extractedAt, `${field}.extractedAt`, issues);
  const normalizedSearchText = asNonEmptyString(
    input.normalizedSearchText,
    `${field}.normalizedSearchText`,
    issues,
  );
  const data = asStringRecord(input.data, `${field}.data`, issues);

  if (!serviceId || !uniqueKey || !extractedAt || !normalizedSearchText || !data) {
    return null;
  }

  return {
    serviceId,
    uniqueKey,
    extractedAt,
    data,
    normalizedSearchText,
  };
};

/**
 * サービス設定を検証し、問題なければ型どおりのオブジェクトを返す。
 *
 * 無効な設定は保存させない（FR-03）。
 */
export const validateServiceConfig = (input: unknown): ValidationResult<ServiceConfig> => {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) {
    return { ok: false, errors: [{ field: "serviceConfig", message: "must be an object" }] };
  }

  const id = asNonEmptyString(input.id, "serviceConfig.id", issues);
  const name = asNonEmptyString(input.name, "serviceConfig.name", issues);
  const urlPatterns = asStringArray(input.urlPatterns, "serviceConfig.urlPatterns", issues);
  const observeRootSelector = asNonEmptyString(
    input.observeRootSelector,
    "serviceConfig.observeRootSelector",
    issues,
  );
  const itemSelector = asNonEmptyString(input.itemSelector, "serviceConfig.itemSelector", issues);
  const uniqueKeyField = asNonEmptyString(
    input.uniqueKeyField,
    "serviceConfig.uniqueKeyField",
    issues,
  );
  const updatedAt = asNonEmptyString(input.updatedAt, "serviceConfig.updatedAt", issues);

  if (typeof input.enabled !== "boolean") {
    issues.push({ field: "serviceConfig.enabled", message: "must be a boolean" });
  }

  const parsedFields: FieldRule[] = [];
  if (!Array.isArray(input.fields) || input.fields.length === 0) {
    issues.push({ field: "serviceConfig.fields", message: "must be a non-empty array" });
  } else {
    for (let index = 0; index < input.fields.length; index += 1) {
      const parsedRule = parseFieldRule(
        input.fields[index],
        `serviceConfig.fields[${index}]`,
        issues,
      );
      if (parsedRule) {
        parsedFields.push(parsedRule);
      }
    }
  }

  // 主キーに指定した名前が fields に存在しないと、抽出後に一意キーが決められない（FR-02/FR-03）。
  if (uniqueKeyField && parsedFields.every((fieldRule) => fieldRule.name !== uniqueKeyField)) {
    issues.push({
      field: "serviceConfig.uniqueKeyField",
      message: "must reference an existing field name",
    });
  }

  if (
    !id ||
    !name ||
    !urlPatterns ||
    !observeRootSelector ||
    !itemSelector ||
    !uniqueKeyField ||
    !updatedAt ||
    typeof input.enabled !== "boolean" ||
    issues.length > 0
  ) {
    return { ok: false, errors: issues };
  }

  return {
    ok: true,
    data: {
      id,
      name,
      urlPatterns,
      observeRootSelector,
      itemSelector,
      uniqueKeyField,
      fields: parsedFields,
      enabled: input.enabled,
      updatedAt,
    },
  };
};

/**
 * 検索クエリを検証する。
 *
 * `keyword` は空文字を許容する（インクリメンタル検索で「全件に近い」状態を表現しうる）。
 */
export const validateSearchQuery = (input: unknown): ValidationResult<SearchQuery> => {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) {
    return { ok: false, errors: [{ field: "searchQuery", message: "must be an object" }] };
  }

  const serviceId = asNonEmptyString(input.serviceId, "searchQuery.serviceId", issues);
  // 型不正時は空文字に落としつつ issues に積む（後段の総合判定で失敗にする）。
  const keyword = typeof input.keyword === "string" ? input.keyword : "";
  if (typeof input.keyword !== "string") {
    issues.push({ field: "searchQuery.keyword", message: "must be a string" });
  }
  const fields = asStringArray(input.fields, "searchQuery.fields", issues);
  const sortBy = asNonEmptyString(input.sortBy, "searchQuery.sortBy", issues);

  if (!isSortOrder(input.sortOrder)) {
    issues.push({ field: "searchQuery.sortOrder", message: "must be asc or desc" });
  }
  if (typeof input.page !== "number" || input.page < 1 || !Number.isInteger(input.page)) {
    issues.push({
      field: "searchQuery.page",
      message: "must be an integer greater than or equal to 1",
    });
  }
  if (
    typeof input.pageSize !== "number" ||
    input.pageSize < 1 ||
    !Number.isInteger(input.pageSize)
  ) {
    issues.push({
      field: "searchQuery.pageSize",
      message: "must be an integer greater than or equal to 1",
    });
  }

  if (
    !serviceId ||
    !fields ||
    !sortBy ||
    !isSortOrder(input.sortOrder) ||
    typeof input.page !== "number" ||
    typeof input.pageSize !== "number" ||
    issues.length > 0
  ) {
    return { ok: false, errors: issues };
  }

  return {
    ok: true,
    data: {
      serviceId,
      keyword,
      fields,
      sortBy,
      sortOrder: input.sortOrder,
      page: input.page,
      pageSize: input.pageSize,
    },
  };
};

/**
 * `records/bulkUpsert` の payload を検証する。
 * 配列の各要素を個別に見て、1 件でも不正なら全体を失敗にする。
 */
export const validateBulkUpsertPayload = (
  input: unknown,
): ValidationResult<{ records: ExtractedRecord[] }> => {
  if (!isRecord(input) || !Array.isArray(input.records)) {
    return {
      ok: false,
      errors: [{ field: "records", message: "must include records array" }],
    };
  }

  const issues: ValidationIssue[] = [];
  const records: ExtractedRecord[] = [];
  for (let index = 0; index < input.records.length; index += 1) {
    const parsedRecord = parseExtractedRecord(input.records[index], `records[${index}]`, issues);
    if (parsedRecord) {
      records.push(parsedRecord);
    }
  }

  if (issues.length > 0) {
    return { ok: false, errors: issues };
  }

  return { ok: true, data: { records } };
};

/** `data/export` 要求の payload（サービス ID のみ）を検証する。 */
export const validateExportPayload = (input: unknown): ValidationResult<{ serviceId: string }> => {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) {
    return { ok: false, errors: [{ field: "exportPayload", message: "must be an object" }] };
  }

  const serviceId = asNonEmptyString(input.serviceId, "exportPayload.serviceId", issues);
  if (!serviceId || issues.length > 0) {
    return { ok: false, errors: issues };
  }
  return { ok: true, data: { serviceId } };
};

/**
 * インポート JSON 全体を検証する（FR-41）。
 *
 * ネストした検証エラーは `importPayload.` プレフィックスを付けてフラットに集約し、
 * メッセージ層の `VALIDATION_ERROR` と一貫した場所特定ができるようにする。
 */
export const validateImportPayload = (input: unknown): ValidationResult<ImportPayload> => {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) {
    return { ok: false, errors: [{ field: "importPayload", message: "must be an object" }] };
  }

  if (typeof input.schemaVersion !== "number") {
    issues.push({ field: "importPayload.schemaVersion", message: "must be a number" });
  }

  const serviceResult = validateServiceConfig(input.service);
  if (!serviceResult.ok) {
    issues.push(
      ...serviceResult.errors.map((error) => ({
        field: `importPayload.${error.field}`,
        message: error.message,
      })),
    );
  }

  const recordsResult = validateBulkUpsertPayload({ records: input.records });
  if (!recordsResult.ok) {
    issues.push(
      ...recordsResult.errors.map((error) => ({
        field: `importPayload.${error.field}`,
        message: error.message,
      })),
    );
  }

  if (!isRecord(input.meta)) {
    issues.push({ field: "importPayload.meta", message: "must be an object" });
  }
  const exportedAt = isRecord(input.meta)
    ? asNonEmptyString(input.meta.exportedAt, "importPayload.meta.exportedAt", issues)
    : null;

  if (
    typeof input.schemaVersion !== "number" ||
    !serviceResult.ok ||
    !recordsResult.ok ||
    !exportedAt ||
    issues.length > 0
  ) {
    return { ok: false, errors: issues };
  }

  return {
    ok: true,
    data: {
      schemaVersion: input.schemaVersion,
      service: serviceResult.data,
      records: recordsResult.data.records,
      meta: { exportedAt },
    },
  };
};
