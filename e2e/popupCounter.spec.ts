// 参照元: https://github.com/wxt-dev/examples/blob/main/examples/playwright-e2e-testing/e2e/pages/popup.ts
import { expect, test } from "./fixtures";
import { openPopup } from "./pages/popup";

// このファイルは環境設定のためのテスト用です。実装が進むにつれてテスト内容を変える必要があります。

test("Popup のカウンターはクリックで増加する", async ({ page, extensionId }) => {
  const popup = await openPopup(page, extensionId);
  expect(await popup.getCounterText()).toEqual("count is 0");

  await popup.clickCounter();
  expect(await popup.getCounterText()).toEqual("count is 1");

  await popup.clickCounter();
  expect(await popup.getCounterText()).toEqual("count is 2");
});
