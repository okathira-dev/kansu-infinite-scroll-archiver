import { describe, expect, it } from "vitest";
import { SUPPORTED_SCHEMA_VERSION } from "@/lib/import-export/schemaVersion";
import {
  validateBulkUpsertPayload,
  validateConfigDeletePayload,
  validateImportPayload,
  validateRecordCountByServicePayload,
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

  it("通知設定が未指定でも既定値を補完して受け入れる", () => {
    const result = validateServiceConfig(validServiceConfig);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.notificationSettings).toEqual({
        badge: {
          showMonitoringIndicator: true,
          showTotalSavedCount: true,
        },
        toast: {
          enabled: true,
          showIncrementCount: true,
        },
      });
    }
  });

  it("通知設定の型が不正な場合は拒否する", () => {
    const result = validateServiceConfig({
      ...validServiceConfig,
      notificationSettings: {
        badge: {
          showMonitoringIndicator: "yes",
        },
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.some(
          (error) =>
            error.field === "serviceConfig.notificationSettings.badge.showMonitoringIndicator",
        ),
      ).toBe(true);
    }
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

  it("regex 型で有効なパターンを受け入れる", () => {
    const result = validateServiceConfig({
      ...validServiceConfig,
      fieldRules: [
        {
          name: "id",
          selector: ".id",
          type: "text" as const,
        },
        {
          name: "digits",
          selector: ".title",
          type: "regex" as const,
          regex: "(\\d+)",
        },
      ],
    });
    expect(result.ok).toBe(true);
  });

  it("regex 型で regex が未指定の場合は拒否する", () => {
    const result = validateServiceConfig({
      ...validServiceConfig,
      fieldRules: [
        {
          name: "id",
          selector: ".id",
          type: "text" as const,
        },
        {
          name: "digits",
          selector: ".title",
          type: "regex" as const,
        },
      ],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.some((error) => error.field.includes("serviceConfig.fieldRules[1].regex")),
      ).toBe(true);
    }
  });

  it("regex 型で不正なパターンを拒否する", () => {
    const result = validateServiceConfig({
      ...validServiceConfig,
      fieldRules: [
        {
          name: "id",
          selector: ".id",
          type: "text" as const,
        },
        {
          name: "digits",
          selector: ".title",
          type: "regex" as const,
          regex: "(",
        },
      ],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.some((error) => error.field.includes("serviceConfig.fieldRules[1].regex")),
      ).toBe(true);
    }
  });
});

describe("サービス別件数ペイロードバリデーション", () => {
  it("有効な serviceId を受け入れる", () => {
    const result = validateRecordCountByServicePayload({ serviceId: "service-1" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.serviceId).toBe("service-1");
    }
  });

  it("空の serviceId を拒否する", () => {
    const result = validateRecordCountByServicePayload({ serviceId: "" });
    expect(result.ok).toBe(false);
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

  it("非対応 schemaVersion を拒否する", () => {
    const now = new Date().toISOString();
    const result = validateImportPayload({
      schemaVersion: SUPPORTED_SCHEMA_VERSION + 1,
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

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.some(
          (error) =>
            error.field === "importPayload.schemaVersion" &&
            error.message.includes("supported schemaVersion"),
        ),
      ).toBe(true);
    }
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
