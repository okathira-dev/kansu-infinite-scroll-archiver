import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, sendRuntimeMessage, test } from "./fixtures";

const FIXTURE_URL = "https://example.com/kansu-e2e/infinite-scroll";
const FIXTURE_FILE = path.resolve("./debug-fixtures/infinite-scroll.html");

interface ResponseError {
  code: string;
  message: string;
  details?: unknown;
}

type RuntimeResponse<TData> = { ok: true; data: TData } | { ok: false; error: ResponseError };

interface SearchRecord {
  serviceId: string;
  uniqueKey: string;
  data: Record<string, string>;
}

interface SearchResponseData {
  records: SearchRecord[];
  total: number;
}

function assertSuccess<TData>(
  response: RuntimeResponse<TData>,
  failureContext: string,
): asserts response is { ok: true; data: TData } {
  if (response.ok) {
    return;
  }

  throw new Error(
    `${failureContext}: ${response.error.code} ${response.error.message} ${JSON.stringify(response.error.details ?? {})}`,
  );
}

const buildSearchRequest = (serviceId: string) => ({
  type: "records/search" as const,
  payload: {
    serviceId,
    keyword: "",
    fields: ["title", "link"],
    sortBy: "title",
    sortOrder: "asc" as const,
    page: 1,
    pageSize: 20,
  },
});

test("無限スクロール抽出: 初回抽出とDOM追加後の再抽出", async ({ context, page, extensionId }) => {
  const serviceId = `service-e2e-infinite-${Date.now()}`;
  const fixtureHtml = await readFile(FIXTURE_FILE, "utf8");

  await page.route(FIXTURE_URL, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html; charset=utf-8",
      body: fixtureHtml,
    });
  });

  const saveResponse = await sendRuntimeMessage<
    RuntimeResponse<{
      configId: string;
    }>
  >(context, extensionId, {
    type: "configs/save",
    payload: {
      id: serviceId,
      name: "E2E Infinite Scroll Fixture",
      urlPatterns: ["https://example.com/kansu-e2e/*"],
      observeRootSelector: "#feed",
      itemSelector: ".item",
      uniqueKeyField: "link",
      fields: [
        { name: "link", selector: ".link", type: "linkUrl" },
        { name: "title", selector: ".title", type: "text" },
      ],
      enabled: true,
      updatedAt: new Date().toISOString(),
    },
  });
  assertSuccess(saveResponse, "設定投入失敗");

  await page.goto(FIXTURE_URL);
  await page.waitForSelector("#feed .item");

  await expect
    .poll(
      async () => {
        const response = await sendRuntimeMessage<RuntimeResponse<SearchResponseData>>(
          context,
          extensionId,
          buildSearchRequest(serviceId),
        );
        assertSuccess(response, "初回抽出待機中の検索失敗");
        return response.data.total;
      },
      {
        timeout: 10_000,
        message: "初回抽出未達: records/search の total が 2 にならない",
      },
    )
    .toBe(2);

  await page.click("#add-item");

  await expect
    .poll(
      async () => {
        const response = await sendRuntimeMessage<RuntimeResponse<SearchResponseData>>(
          context,
          extensionId,
          buildSearchRequest(serviceId),
        );
        assertSuccess(response, "再抽出待機中の検索失敗");
        return response.data.total;
      },
      {
        timeout: 10_000,
        message: "再抽出未達: DOM 追加後に total が 3 にならない",
      },
    )
    .toBe(3);

  await page.click("#add-items-10");

  await expect
    .poll(
      async () => {
        const response = await sendRuntimeMessage<RuntimeResponse<SearchResponseData>>(
          context,
          extensionId,
          buildSearchRequest(serviceId),
        );
        assertSuccess(response, "一括追加後の再抽出待機中の検索失敗");
        return response.data.total;
      },
      {
        timeout: 10_000,
        message: "一括追加後の再抽出未達: DOM 一括追加後に total が 13 にならない",
      },
    )
    .toBe(13);

  const finalResponse = await sendRuntimeMessage<RuntimeResponse<SearchResponseData>>(
    context,
    extensionId,
    buildSearchRequest(serviceId),
  );
  assertSuccess(finalResponse, "最終確認の検索失敗");
  expect(
    finalResponse.data.records.some((record) => record.uniqueKey === "https://example.com/post-3"),
  ).toBe(true);
  expect(
    finalResponse.data.records.some((record) => record.uniqueKey === "https://example.com/post-13"),
  ).toBe(true);
});
