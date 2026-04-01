import { describe, expect, it } from "vitest";
import { MessageRouter } from "./router";

const serviceConfigPayload = {
  id: "service-1",
  name: "Example",
  urlPatterns: ["*://example.com/*"],
  observeRootSelector: "body",
  itemSelector: ".item",
  uniqueKeyField: "id",
  fields: [
    { name: "id", selector: ".id", type: "text" as const },
    { name: "title", selector: ".title", type: "text" as const },
  ],
  enabled: true,
  updatedAt: new Date().toISOString(),
};

describe("メッセージルータ", () => {
  it("未知の type ではバリデーションエラーを返す", async () => {
    const router = new MessageRouter();

    const response = await router.handleRaw({
      type: "unknown/type",
    });

    expect(response.ok).toBe(false);
    if (!response.ok) {
      expect(response.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("設定の保存と一覧取得を処理できる", async () => {
    const router = new MessageRouter();

    const saveResponse = await router.handleRaw({
      type: "configs/save",
      payload: serviceConfigPayload,
    });
    expect(saveResponse.ok).toBe(true);

    const listResponse = await router.handleRaw({ type: "configs/list" });
    expect(listResponse.ok).toBe(true);
    if (listResponse.ok) {
      const data = listResponse.data as { configs: Array<{ id: string }> };
      expect(data.configs).toHaveLength(1);
      expect(data.configs[0]?.id).toBe("service-1");
    }
  });

  it("一括 upsert と検索を処理できる", async () => {
    const router = new MessageRouter();

    await router.handleRaw({
      type: "configs/save",
      payload: serviceConfigPayload,
    });

    const upsertResponse = await router.handleRaw({
      type: "records/bulkUpsert",
      payload: {
        records: [
          {
            serviceId: "service-1",
            uniqueKey: "r1",
            extractedAt: new Date().toISOString(),
            normalizedSearchText: "title one",
            data: { id: "r1", title: "Title 1" },
          },
        ],
      },
    });

    expect(upsertResponse.ok).toBe(true);

    const searchResponse = await router.handleRaw({
      type: "records/search",
      payload: {
        serviceId: "service-1",
        keyword: "title",
        fields: ["title"],
        sortBy: "title",
        sortOrder: "asc",
        page: 1,
        pageSize: 10,
      },
    });

    expect(searchResponse.ok).toBe(true);
    if (searchResponse.ok) {
      const data = searchResponse.data as {
        total: number;
        records: Array<{ uniqueKey: string }>;
      };
      expect(data.total).toBe(1);
      expect(data.records[0]?.uniqueKey).toBe("r1");
    }
  });
});
