import { readFile } from "node:fs/promises";
import path from "node:path";
import { E2E_BACKGROUND_SYNC_TIMEOUT_MS, E2E_STEP_TIMEOUT_MS } from "./constants";
import { expect, sendRuntimeMessage, test } from "./fixtures";
import { waitForMainPanel } from "./pages/mainPanel";
import { openPopup } from "./pages/popup";

const FIXTURE_URL = "https://example.com/kansu-e2e/infinite-scroll";
const FIXTURE_FILE = path.resolve("./debug-fixtures/infinite-scroll.html");

interface ResponseError {
  code: string;
  message: string;
  details?: unknown;
}

type RuntimeResponse<TData> = { ok: true; data: TData } | { ok: false; error: ResponseError };

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

test("メインUI: 検索・ソート・ページ移動を実行できる", async ({ context, page, extensionId }) => {
  const serviceId = `service-e2e-main-ui-${Date.now()}`;
  const fixtureHtml = await readFile(FIXTURE_FILE, "utf8");

  await page.route(FIXTURE_URL, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html; charset=utf-8",
      body: fixtureHtml,
    });
  });

  const saveResponse = await sendRuntimeMessage<RuntimeResponse<{ configId: string }>>(
    context,
    extensionId,
    {
      type: "configs/save",
      payload: {
        id: serviceId,
        name: "E2E Main UI Fixture",
        urlPatterns: ["https://example.com/kansu-e2e/*"],
        observeRootSelector: "#feed",
        itemSelector: ".item",
        uniqueKeyField: "link",
        fieldRules: [
          { name: "link", selector: ".link", type: "linkUrl" },
          { name: "title", selector: ".title", type: "text" },
        ],
        enabled: true,
        updatedAt: new Date().toISOString(),
      },
    },
  );
  assertSuccess(saveResponse, "設定投入失敗");

  await page.goto(FIXTURE_URL);
  await page.waitForSelector("#feed .item", { timeout: E2E_STEP_TIMEOUT_MS });
  await page.click("#add-items-10");

  const popupPage = await context.newPage();
  const popup = await openPopup(popupPage, extensionId);
  await popup.clickToggleMainUi();
  await expect
    .poll(async () => await popup.getStatusText(), { timeout: E2E_STEP_TIMEOUT_MS })
    .toBe("メインUIの表示切替を送信しました");
  await popupPage.close();

  const mainPanel = await waitForMainPanel(page);
  await expect(mainPanel.getPanel()).toBeVisible();

  await mainPanel.fillKeyword("English headline #2");
  await expect(mainPanel.getPanel().getByText("English headline #2")).toBeVisible();

  await mainPanel.fillKeyword("");
  await expect
    .poll(async () => await mainPanel.getPanel().textContent(), {
      timeout: E2E_BACKGROUND_SYNC_TIMEOUT_MS,
    })
    .toContain("合計 12 件");
  await mainPanel.goToNextPage();
  await expect(mainPanel.getPanel().getByText("2 / 2 ページ")).toBeVisible();
  await mainPanel.goToPrevPage();
  await expect(mainPanel.getPanel().getByText("1 / 2 ページ")).toBeVisible();

  await mainPanel.clickSortBy("title");
  await expect(mainPanel.getPanel().getByText("日本語タイトル #1")).toBeVisible();
});
