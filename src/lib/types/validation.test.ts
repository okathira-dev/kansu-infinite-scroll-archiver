import { describe, expect, it } from "vitest";
import {
  validateBulkUpsertPayload,
  validateConfigDeletePayload,
  validateImportPayload,
  validateSearchQuery,
  validateServiceConfig,
} from "./validation";

const validServiceConfig = {
  id: "service-1",
  name: "Example Service",
  urlPatterns: ["*://example.com/*"],
  observeRootSelector: "body",
  itemSelector: ".item",
  uniqueKeyField: "id",
  fieldRules: [
    {
      name: "id",
      selector: ".id",
      type: "text" as const,
    },
    {
      name: "title",
      selector: ".title",
      type: "text" as const,
    },
  ],
  enabled: true,
  updatedAt: new Date().toISOString(),
};

describe("サービス設定バリデーション", () => {
  it("有効な設定を受け入れる", () => {
    const result = validateServiceConfig(validServiceConfig);
    expect(result.ok).toBe(true);
  });

  it("uniqueKeyField が fieldRules に存在しない場合は拒否する", () => {
    const result = validateServiceConfig({
      ...validServiceConfig,
      uniqueKeyField: "unknown",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((error) => error.field.includes("uniqueKeyField"))).toBe(true);
    }
  });
});

describe("検索クエリバリデーション", () => {
  it("有効な検索クエリを受け入れる", () => {
    const result = validateSearchQuery({
      serviceId: "service-1",
      keyword: "abc",
      targetFieldNames: ["title"],
      sortBy: "title",
      sortOrder: "asc",
      page: 1,
      pageSize: 20,
    });

    expect(result.ok).toBe(true);
  });

  it("無効な sortOrder を拒否する", () => {
    const result = validateSearchQuery({
      serviceId: "service-1",
      keyword: "abc",
      targetFieldNames: ["title"],
      sortBy: "title",
      sortOrder: "up",
      page: 1,
      pageSize: 20,
    });

    expect(result.ok).toBe(false);
  });
});

describe("一括 upsert ペイロードバリデーション", () => {
  it("不正な records ペイロードを拒否する", () => {
    const result = validateBulkUpsertPayload({ records: [{ serviceId: "s1" }] });
    expect(result.ok).toBe(false);
  });
});

describe("インポートペイロードバリデーション", () => {
  it("有効なインポートペイロードを受け入れる", () => {
    const now = new Date().toISOString();
    const result = validateImportPayload({
      schemaVersion: 1,
      service: validServiceConfig,
      records: [
        {
          serviceId: "service-1",
          uniqueKey: "k1",
          extractedAt: now,
          fieldValues: {
            id: { raw: "k1", normalized: "k1" },
            title: { raw: "hello", normalized: "hello" },
          },
        },
      ],
      meta: {
        exportedAt: now,
      },
    });

    expect(result.ok).toBe(true);
  });
});

describe("設定削除ペイロードバリデーション", () => {
  it("有効な削除ペイロードを受け入れる", () => {
    const result = validateConfigDeletePayload({
      id: "service-1",
      deleteRecords: true,
    });
    expect(result.ok).toBe(true);
  });

  it("id が空文字の場合は拒否する", () => {
    const result = validateConfigDeletePayload({
      id: "",
    });
    expect(result.ok).toBe(false);
  });
});
