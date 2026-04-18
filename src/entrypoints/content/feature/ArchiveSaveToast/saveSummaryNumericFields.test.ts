import { describe, expect, it } from "vitest";
import type { SaveSummaryEventDetail } from "@/lib/messages/systemEvents";
import { resolveServiceNotificationSettings } from "@/lib/types";
import { isSaveSummaryNumericFields } from "./saveSummaryNumericFields";

const baseDetail = (): SaveSummaryEventDetail => ({
  serviceId: "svc-1",
  serviceName: "Demo",
  processed: 5,
  created: 2,
  updated: 3,
  totalSaved: 24,
  notificationSettings: resolveServiceNotificationSettings(undefined),
});

describe("isSaveSummaryNumericFields", () => {
  it("processed/created/updated/totalSaved が全て0以上の有限数なら true", () => {
    expect(isSaveSummaryNumericFields(baseDetail())).toBe(true);
  });

  it("数値フィールドのいずれかが欠けると false", () => {
    const detail = baseDetail() as unknown as Record<string, unknown>;
    delete detail.updated;
    expect(isSaveSummaryNumericFields(detail)).toBe(false);
  });

  it("負数が含まれると false", () => {
    const detail = { ...baseDetail(), created: -1 };
    expect(isSaveSummaryNumericFields(detail)).toBe(false);
  });
});
