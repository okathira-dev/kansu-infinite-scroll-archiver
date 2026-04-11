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

/**
 * 拡張コンテキスト（popup ページ）から runtime message を送信する。
 *
 * Service Worker から自分自身へ送る経路を避けるため、常に拡張ページ経由で実行する。
 */
export const sendRuntimeMessage = async <TResponse>(
  context: BrowserContext,
  extensionId: string,
  message: unknown,
): Promise<TResponse> => {
  const extensionPage = await context.newPage();
  try {
    await extensionPage.goto(`chrome-extension://${extensionId}/popup.html`);
    const response = await extensionPage.evaluate(async (request) => {
      const runtime = (
        globalThis as {
          chrome?: {
            runtime?: {
              lastError?: { message?: string };
              sendMessage: (payload: unknown, callback: (result: unknown) => void) => void;
            };
          };
        }
      ).chrome?.runtime;
      if (!runtime) {
        throw new Error("runtime API is not available");
      }

      return await new Promise<unknown>((resolve, reject) => {
        runtime.sendMessage(request, (result: unknown) => {
          if (runtime.lastError) {
            reject(new Error(runtime.lastError.message ?? "unknown runtime error"));
            return;
          }
          resolve(result);
        });
      });
    }, message);
    return response as TResponse;
  } finally {
    await extensionPage.close();
  }
};
