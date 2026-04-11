import Dexie from "dexie";
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import { KansuDb } from "@/lib/db";
import { SUPPORTED_SCHEMA_VERSION } from "@/lib/import-export/schemaVersion";
import { RecordRepository, ServiceConfigRepository } from "@/lib/repositories";
import { MessageRouter } from "./router";

let testDbSequence = 0;

const createTestRouter = () => {
  const db = new KansuDb(`kansu-router-test-${testDbSequence}`);
  testDbSequence += 1;
  return {
    db,
    router: new MessageRouter({
      serviceConfigRepository: new ServiceConfigRepository(db),
      recordRepository: new RecordRepository(db),
    }),
  };
};

const closeAndDeleteDb = async (db: KansuDb) => {
  db.close();
  await db.delete();
};

const serviceConfigPayload = {
  id: "service-1",
  name: "Example",
  urlPatterns: ["*://example.com/*"],
  observeRootSelector: "body",
  itemSelector: ".item",
  uniqueKeyField: "id",
  fieldRules: [
    { name: "id", selector: ".id", type: "text" as const },
    { name: "title", selector: ".title", type: "text" as const },
  ],
  enabled: true,
  updatedAt: new Date().toISOString(),
};

const createImportPayload = (schemaVersion = SUPPORTED_SCHEMA_VERSION) => ({
  schemaVersion,
  service: serviceConfigPayload,
  records: [
    {
      serviceId: "service-1",
      uniqueKey: "r1",
      extractedAt: new Date().toISOString(),
      fieldValues: {
        id: { raw: "r1", normalized: "r1" },
        title: { raw: "imported title", normalized: "imported title" },
      },
    },
    {
      serviceId: "service-1",
      uniqueKey: "r2",
      extractedAt: new Date().toISOString(),
      fieldValues: {
        id: { raw: "r2", normalized: "r2" },
        title: { raw: "imported title 2", normalized: "imported title 2" },
      },
    },
  ],
  meta: {
    exportedAt: new Date().toISOString(),
  },
});

describe("メッセージルータ", () => {
  // Node 環境の Vitest には IndexedDB 実装がないため、Dexie の依存先をモックに差し替える。
  // これにより本番コード（KansuDb / Repository）を変更せず、永続化経路をそのまま検証できる。
  Dexie.dependencies.indexedDB = new IDBFactory();
  Dexie.dependencies.IDBKeyRange = IDBKeyRange;

  it("未知の type ではバリデーションエラーを返す", async () => {
    const { db, router } = createTestRouter();

    const response = await router.handleRaw({
      type: "unknown/type",
    });

    expect(response.ok).toBe(false);
    if (!response.ok) {
      expect(response.error.code).toBe("VALIDATION_ERROR");
    }
    await closeAndDeleteDb(db);
  });

  it("設定の保存と一覧取得を処理できる", async () => {
    const { db, router } = createTestRouter();

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
    await closeAndDeleteDb(db);
  });

  it("設定削除（関連レコード削除あり）を処理できる", async () => {
    const { db, router } = createTestRouter();

    await router.handleRaw({
      type: "configs/save",
      payload: serviceConfigPayload,
    });
    await router.handleRaw({
      type: "records/bulkUpsert",
      payload: {
        records: [
          {
            serviceId: "service-1",
            uniqueKey: "r1",
            extractedAt: new Date().toISOString(),
            fieldValues: {
              id: { raw: "r1", normalized: "r1" },
              title: { raw: "Title 1", normalized: "title 1" },
            },
          },
        ],
      },
    });

    const deleteResponse = await router.handleRaw({
      type: "configs/delete",
      payload: { id: "service-1", deleteRecords: true },
    });
    expect(deleteResponse.ok).toBe(true);
    if (deleteResponse.ok) {
      expect(deleteResponse.data).toEqual({ configId: "service-1", deletedRecords: 1 });
    }

    const listResponse = await router.handleRaw({ type: "configs/list" });
    expect(listResponse.ok).toBe(true);
    if (listResponse.ok) {
      const data = listResponse.data as { configs: Array<{ id: string }> };
      expect(data.configs).toHaveLength(0);
    }

    const searchResponse = await router.handleRaw({
      type: "records/search",
      payload: {
        serviceId: "service-1",
        keyword: "",
        targetFieldNames: ["title"],
        sortBy: "title",
        sortOrder: "asc",
        page: 1,
        pageSize: 10,
      },
    });
    expect(searchResponse.ok).toBe(true);
    if (searchResponse.ok) {
      const data = searchResponse.data as { total: number };
      expect(data.total).toBe(0);
    }
    await closeAndDeleteDb(db);
  });

  it("一括 upsert と検索を処理できる", async () => {
    const { db, router } = createTestRouter();

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
            fieldValues: {
              id: { raw: "r1", normalized: "r1" },
              title: { raw: "Title 1", normalized: "title 1" },
            },
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
        targetFieldNames: ["title"],
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
    await closeAndDeleteDb(db);
  });

  it("サービス単位エクスポートを処理できる", async () => {
    const { db, router } = createTestRouter();

    await router.handleRaw({
      type: "configs/save",
      payload: serviceConfigPayload,
    });
    await router.handleRaw({
      type: "records/bulkUpsert",
      payload: {
        records: [
          {
            serviceId: "service-1",
            uniqueKey: "r1",
            extractedAt: new Date().toISOString(),
            fieldValues: {
              id: { raw: "r1", normalized: "r1" },
              title: { raw: "Title 1", normalized: "title 1" },
            },
          },
        ],
      },
    });

    const exportResponse = await router.handleRaw({
      type: "data/export",
      payload: { serviceId: "service-1" },
    });
    expect(exportResponse.ok).toBe(true);
    if (exportResponse.ok) {
      const data = exportResponse.data as {
        schemaVersion: number;
        service: { id: string };
        records: Array<{ uniqueKey: string }>;
      };
      expect(data.schemaVersion).toBe(SUPPORTED_SCHEMA_VERSION);
      expect(data.service.id).toBe("service-1");
      expect(data.records).toHaveLength(1);
      expect(data.records[0]?.uniqueKey).toBe("r1");
    }
    await closeAndDeleteDb(db);
  });

  it("インポートで upsert 集計を返せる", async () => {
    const { db, router } = createTestRouter();

    await router.handleRaw({
      type: "configs/save",
      payload: serviceConfigPayload,
    });
    await router.handleRaw({
      type: "records/bulkUpsert",
      payload: {
        records: [
          {
            serviceId: "service-1",
            uniqueKey: "r1",
            extractedAt: new Date().toISOString(),
            fieldValues: {
              id: { raw: "r1", normalized: "r1" },
              title: { raw: "before import", normalized: "before import" },
            },
          },
        ],
      },
    });

    const importResponse = await router.handleRaw({
      type: "data/import",
      payload: createImportPayload(),
    });
    expect(importResponse.ok).toBe(true);
    if (importResponse.ok) {
      expect(importResponse.data).toEqual({
        serviceId: "service-1",
        imported: 2,
        created: 1,
        updated: 1,
      });
    }
    await closeAndDeleteDb(db);
  });

  it("非対応 schemaVersion では専用エラーを返す", async () => {
    const { db, router } = createTestRouter();
    const response = await router.handleRaw({
      type: "data/import",
      payload: createImportPayload(SUPPORTED_SCHEMA_VERSION + 1),
    });

    expect(response.ok).toBe(false);
    if (!response.ok) {
      expect(response.error.code).toBe("UNSUPPORTED_SCHEMA_VERSION");
    }
    await closeAndDeleteDb(db);
  });
});
