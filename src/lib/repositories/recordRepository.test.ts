import Dexie from "dexie";
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { KansuDb } from "@/lib/db";
import { normalizeForSearch } from "@/lib/search/textNormalization";
import type { ExtractedRecord, SearchQuery } from "@/lib/types";
import { RecordRepository } from "./recordRepository";

let sequence = 0;
const activeDbs: KansuDb[] = [];

const createRecord = (params: {
  serviceId: string;
  uniqueKey: string;
  title: string;
}): ExtractedRecord => ({
  serviceId: params.serviceId,
  uniqueKey: params.uniqueKey,
  extractedAt: "2026-04-02T00:00:00.000Z",
  fieldValues: {
    id: {
      raw: params.uniqueKey,
      normalized: normalizeForSearch(params.uniqueKey),
    },
    title: {
      raw: params.title,
      normalized: normalizeForSearch(params.title),
    },
  },
});

const createRepository = () => {
  const db = new KansuDb(`kansu-record-test-${sequence}`);
  sequence += 1;
  activeDbs.push(db);
  return new RecordRepository(db);
};

beforeAll(() => {
  // Dexie は実行環境の IndexedDB 実装に依存するため、テストでは fake-indexeddb を注入する。
  // これを行わないと `indexedDB` が未定義となり、Repository の transaction/bulkPut 検証ができない。
  Dexie.dependencies.indexedDB = new IDBFactory();
  Dexie.dependencies.IDBKeyRange = IDBKeyRange;
});

afterEach(async () => {
  while (activeDbs.length > 0) {
    const db = activeDbs.pop();
    if (!db) {
      continue;
    }
    db.close();
    await db.delete();
  }
});

describe("RecordRepository", () => {
  it("同一主キーの upsert を更新として集計できる", async () => {
    const repository = createRepository();
    await repository.bulkUpsert([
      createRecord({ serviceId: "service-1", uniqueKey: "r1", title: "初期タイトル" }),
    ]);

    const result = await repository.bulkUpsert([
      createRecord({ serviceId: "service-1", uniqueKey: "r1", title: "更新タイトル" }),
    ]);

    expect(result).toEqual({
      processed: 1,
      created: 0,
      updated: 1,
    });

    const records = await repository.listByServiceId("service-1");
    expect(records).toHaveLength(1);
    expect(records[0]?.fieldValues.title?.raw).toBe("更新タイトル");
  });

  it("countByServiceId が保存件数を返す", async () => {
    const repository = createRepository();
    await repository.bulkUpsert([
      createRecord({ serviceId: "svc-a", uniqueKey: "a1", title: "t1" }),
      createRecord({ serviceId: "svc-a", uniqueKey: "a2", title: "t2" }),
      createRecord({ serviceId: "svc-b", uniqueKey: "b1", title: "t3" }),
    ]);
    expect(await repository.countByServiceId("svc-a")).toBe(2);
    expect(await repository.countByServiceId("svc-b")).toBe(1);
    expect(await repository.countByServiceId("svc-none")).toBe(0);
  });

  it("countAllByServiceId がサービス ID ごとの件数を返す", async () => {
    const repository = createRepository();
    await repository.bulkUpsert([
      createRecord({ serviceId: "svc-a", uniqueKey: "a1", title: "t1" }),
      createRecord({ serviceId: "svc-a", uniqueKey: "a2", title: "t2" }),
      createRecord({ serviceId: "svc-b", uniqueKey: "b1", title: "t3" }),
    ]);
    expect(await repository.countAllByServiceId()).toEqual({
      "svc-a": 2,
      "svc-b": 1,
    });
  });

  it("bulkPut が途中で失敗した場合に transaction をロールバックする", async () => {
    const repository = createRepository();
    const invalidRecord = {
      ...createRecord({ serviceId: "service-1", uniqueKey: "r2", title: "invalid" }),
      uniqueKey: undefined as unknown as string,
    };

    await expect(
      repository.bulkUpsert([
        createRecord({ serviceId: "service-1", uniqueKey: "r1", title: "valid" }),
        invalidRecord,
      ]),
    ).rejects.toBeInstanceOf(Error);

    const records = await repository.listByServiceId("service-1");
    expect(records).toHaveLength(0);
  });

  it("ページネーション境界値で total を維持しつつ結果件数を正しく返す", async () => {
    const repository = createRepository();
    await repository.bulkUpsert([
      createRecord({ serviceId: "service-1", uniqueKey: "r1", title: "A" }),
      createRecord({ serviceId: "service-1", uniqueKey: "r2", title: "B" }),
      createRecord({ serviceId: "service-1", uniqueKey: "r3", title: "C" }),
    ]);

    const baseQuery: Omit<SearchQuery, "page"> = {
      serviceId: "service-1",
      keyword: "",
      targetFieldNames: ["title"],
      sortBy: "title",
      sortOrder: "asc",
      pageSize: 2,
    };

    const secondPage = await repository.search({ ...baseQuery, page: 2 });
    expect(secondPage.total).toBe(3);
    expect(secondPage.records).toHaveLength(1);
    expect(secondPage.records[0]?.uniqueKey).toBe("r3");

    const outOfRange = await repository.search({ ...baseQuery, page: 3 });
    expect(outOfRange.total).toBe(3);
    expect(outOfRange.records).toHaveLength(0);
  });

  it("targetFieldNames で指定したフィールドのみを検索対象にする", async () => {
    const repository = createRepository();
    await repository.bulkUpsert([
      createRecord({ serviceId: "service-1", uniqueKey: "foo-1", title: "Alpha" }),
      createRecord({ serviceId: "service-1", uniqueKey: "bar-1", title: "foo headline" }),
    ]);

    const titleOnly = await repository.search({
      serviceId: "service-1",
      keyword: "foo",
      targetFieldNames: ["title"],
      sortBy: "title",
      sortOrder: "asc",
      page: 1,
      pageSize: 10,
    });
    expect(titleOnly.total).toBe(1);
    expect(titleOnly.records[0]?.uniqueKey).toBe("bar-1");

    const idOnly = await repository.search({
      serviceId: "service-1",
      keyword: "foo",
      targetFieldNames: ["id"],
      sortBy: "title",
      sortOrder: "asc",
      page: 1,
      pageSize: 10,
    });
    expect(idOnly.total).toBe(1);
    expect(idOnly.records[0]?.uniqueKey).toBe("foo-1");
  });

  it("サービス単位でレコードを削除できる", async () => {
    const repository = createRepository();
    await repository.bulkUpsert([
      createRecord({ serviceId: "service-1", uniqueKey: "r1", title: "A" }),
      createRecord({ serviceId: "service-1", uniqueKey: "r2", title: "B" }),
      createRecord({ serviceId: "service-2", uniqueKey: "r1", title: "C" }),
    ]);

    const deleted = await repository.deleteByServiceId("service-1");
    expect(deleted).toBe(2);

    const service1Records = await repository.listByServiceId("service-1");
    const service2Records = await repository.listByServiceId("service-2");
    expect(service1Records).toHaveLength(0);
    expect(service2Records).toHaveLength(1);
  });
});
