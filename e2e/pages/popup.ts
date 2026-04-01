// 参照元: https://github.com/wxt-dev/examples/blob/main/examples/playwright-e2e-testing/e2e/pages/popup.ts
import type { Page } from "@playwright/test";

// このファイルは環境設定のためのテスト用です。実装が進むにつれてテスト内容を変える必要があります。

export async function openPopup(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  await page.waitForSelector("#counter");

  const popup = {
    getCounter: () => page.waitForSelector("#counter"),
    clickCounter: async () => {
      const counter = await popup.getCounter();
      await counter.click();
    },
    getCounterText: async () => {
      const counter = await popup.getCounter();
      return await counter.evaluate((el) => el.textContent);
    },
  };
  return popup;
}
