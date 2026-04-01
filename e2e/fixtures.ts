// 参照元: https://github.com/wxt-dev/examples/blob/main/examples/playwright-e2e-testing/e2e/fixtures.ts

import path from "node:path";
import { type BrowserContext, test as base, chromium } from "@playwright/test";

const pathToExtension = path.resolve(".output/chrome-mv3");

const getAnyWorker = async (context: BrowserContext) => {
  if (pathToExtension.endsWith("-mv3")) {
    // service workerをチェック
    // 何でも良いので、最初のworkerを用いる。
    const [firstWorker] = context.serviceWorkers();
    if (firstWorker) {
      return firstWorker;
    } else {
      // なければ待つ
      return await context.waitForEvent("serviceworker");
    }
  } else {
    // background pageをチェック
    // 何でも良いので、最初のbackground pageを用いる。
    const [firstPage] = context.backgroundPages();
    if (firstPage) {
      return firstPage;
    } else {
      // なければ待つ
      return await context.waitForEvent("backgroundpage");
    }
  }
};

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  // 拡張機能の読み込みと起動
  // biome-ignore lint/correctness/noEmptyPattern: playwrightの制限によりdestructuringが必須のため `_` は使えない ref: https://github.com/microsoft/playwright/issues/8798
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext("", {
      headless: true,
      // Google Chrome / Edge はサイドロード用 CLI フラグを削除済み。拡張の E2E は Playwright 同梱の Chromium が必要。
      // https://playwright.dev/docs/chrome-extensions
      channel: "chromium",
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });

    await use(context);
    await context.close();
  },
  // 拡張機能のIDを取得
  extensionId: async ({ context }, use) => {
    const worker = await getAnyWorker(context);
    const extensionId = worker.url().split("/")[2];
    await use(extensionId);
  },
});

export const expect = test.expect;
