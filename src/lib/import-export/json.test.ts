/** `json.ts` の round-trip・不正入力・ファイル名のユニットテスト。 */
import { describe, expect, it } from "vitest";
import type { ExportPayload } from "@/lib/types";
import {
  createExportFileName,
  parseImportJsonText,
  SUPPORTED_SCHEMA_VERSION,
  stringifyExportPayload,
} from "./index";

const samplePayload: ExportPayload = {
  schemaVersion: SUPPORTED_SCHEMA_VERSION,
  service: {
    id: "service-1",
    name: "Example Service",
    urlPatterns: ["*://example.com/*"],
    observeRootSelector: "body",
    itemSelector: ".item",
    uniqueKeyField: "id",
    fieldRules: [{ name: "id", selector: ".id", type: "text" }],
    enabled: true,
    notificationSettings: {
      badge: {
        showMonitoringIndicator: true,
        showTotalSavedCount: true,
      },
      toast: {
        enabled: true,
        showIncrementCount: true,
      },
    },
    updatedAt: "2026-04-09T00:00:00.000Z",
  },
  records: [
    {
      serviceId: "service-1",
      uniqueKey: "record-1",
      extractedAt: "2026-04-09T00:00:00.000Z",
      fieldValues: {
        id: { raw: "record-1", normalized: "record-1" },
      },
    },
  ],
  meta: {
    exportedAt: "2026-04-09T00:00:00.000Z",
  },
};

describe("import-export JSON 補助", () => {
  it("エクスポート JSON を round-trip でパースできる", () => {
    const json = stringifyExportPayload(samplePayload);
    const parsed = parseImportJsonText(json);

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data).toEqual(samplePayload);
    }
  });

  it("不正 JSON を拒否する", () => {
    const parsed = parseImportJsonText("{invalid-json}");
    expect(parsed.ok).toBe(false);
  });

  it("非対応 schemaVersion を拒否する", () => {
    const json = stringifyExportPayload({
      ...samplePayload,
      schemaVersion: SUPPORTED_SCHEMA_VERSION + 1,
    });
    const parsed = parseImportJsonText(json);
    expect(parsed.ok).toBe(false);
  });

  it("エクスポートファイル名を組み立てる", () => {
    const fileName = createExportFileName("service:1", "2026-04-09T00:00:00.000Z");
    expect(fileName).toContain("kansu-service-1");
    expect(fileName.endsWith(".json")).toBe(true);
  });
});
