import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { browser } from "wxt/browser";
import { useSearchStore } from "./searchStore";

describe("useSearchStore", () => {
  beforeEach(() => {
    useSearchStore.getState().reset({
      serviceId: "svc-1",
      keyword: "",
      targetFieldNames: ["title"],
      sortBy: "title",
      sortOrder: "asc",
      page: 1,
      pageSize: 10,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("targetFieldNames が空のとき結果をクリアする", async () => {
    const sendMessage = vi.spyOn(browser.runtime, "sendMessage");
    useSearchStore.getState().setTargetFieldNames([]);
    await useSearchStore.getState().search();
    expect(useSearchStore.getState().result.total).toBe(0);
    expect(useSearchStore.getState().result.records).toHaveLength(0);
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("古い検索の応答は最新の検索結果を上書きしない", async () => {
    let resolveSlow: ((value: unknown) => void) | undefined;
    const slowPromise = new Promise((resolve) => {
      resolveSlow = resolve;
    });

    const minimalRecord = (uniqueKey: string) => ({
      serviceId: "svc-1",
      uniqueKey,
      extractedAt: "2020-01-01T00:00:00.000Z",
      fieldValues: {
        title: { raw: "t", normalized: "t" },
      },
    });

    let callCount = 0;
    const sendMessage = vi.spyOn(browser.runtime, "sendMessage").mockImplementation(() => {
      callCount += 1;
      if (callCount === 1) {
        return slowPromise;
      }
      return Promise.resolve({
        ok: true,
        data: { records: [minimalRecord("newer")], total: 1 },
      });
    });

    const search = useSearchStore.getState().search;
    const firstSearch = search();
    const secondSearch = search();

    expect(sendMessage).toHaveBeenCalledTimes(2);

    await secondSearch;
    expect(useSearchStore.getState().result.total).toBe(1);
    expect(useSearchStore.getState().result.records[0]?.uniqueKey).toBe("newer");

    resolveSlow?.({
      ok: true,
      data: { records: [minimalRecord("stale")], total: 99 },
    });
    await firstSearch;

    expect(useSearchStore.getState().result.total).toBe(1);
    expect(useSearchStore.getState().result.records[0]?.uniqueKey).toBe("newer");
  });
});
