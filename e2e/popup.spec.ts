import { readFile } from "node:fs/promises";
import path from "node:path";
import { E2E_STEP_TIMEOUT_MS } from "./constants";
import { expect, test } from "./fixtures";
import { openPopup } from "./pages/popup";

const FIXTURE_URL = "https://example.com/kansu-e2e/infinite-scroll";
const FIXTURE_FILE = path.resolve("./debug-fixtures/infinite-scroll.html");

test("Popup: メインUI切替メッセージを現在タブへ送信できる", async ({
  context,
  page,
  extensionId,
}) => {
  const fixtureHtml = await readFile(FIXTURE_FILE, "utf8");
  await page.route(FIXTURE_URL, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html; charset=utf-8",
      body: fixtureHtml,
    });
  });
  await page.goto(FIXTURE_URL);
  await page.waitForSelector("#feed .item", { timeout: E2E_STEP_TIMEOUT_MS });

  const popupPage = await context.newPage();
  const popup = await openPopup(popupPage, extensionId);
  await popup.clickToggleMainUi();
  await expect
    .poll(async () => await popup.getStatusText(), { timeout: E2E_STEP_TIMEOUT_MS })
    .toBe("メインUIの表示切替を送信しました");

  await expect(page.locator("#kansu-main-panel")).toBeVisible({ timeout: E2E_STEP_TIMEOUT_MS });
  await popupPage.close();
});

test("Popup: Options ページを開ける", async ({ context, extensionId }) => {
  const popupPage = await context.newPage();
  const popup = await openPopup(popupPage, extensionId);

  await popup.clickOpenOptions();
  await expect(await popup.getStatusText()).toContain("開きました");

  await popupPage.close();
});
