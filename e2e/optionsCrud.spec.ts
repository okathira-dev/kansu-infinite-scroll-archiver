import { expect, test } from "./fixtures";
import { openOptionsPage } from "./pages/options";

test("Options: サービス設定を追加して削除できる", async ({ page, extensionId }) => {
  const options = await openOptionsPage(page, extensionId);
  const serviceId = `service-e2e-options-${Date.now()}`;
  const serviceName = `E2E Options ${Date.now()}`;

  await options.clickNewConfig();
  await options.fillConfigForm({
    id: serviceId,
    name: serviceName,
    urlPatternsText: "https://example.com/kansu-e2e/*",
    observeRootSelector: "#feed",
    itemSelector: ".item",
    uniqueKeyField: "title",
    fieldName: "title",
    fieldSelector: ".title",
  });
  await options.clickSave();

  await expect(page.getByText(serviceName)).toBeVisible();

  await options.clickDeleteByName(serviceName);
  await options.confirmDelete();
  await expect(page.getByText(serviceName)).toHaveCount(0);
});

test("Options: 既存設定を編集して保存できる", async ({ page, extensionId }) => {
  const options = await openOptionsPage(page, extensionId);
  const serviceId = `service-e2e-options-edit-${Date.now()}`;
  const serviceName = `E2E Options Edit ${Date.now()}`;
  const updatedName = `${serviceName}（更新）`;

  await options.clickNewConfig();
  await options.fillConfigForm({
    id: serviceId,
    name: serviceName,
    urlPatternsText: "https://example.com/kansu-e2e-edit/*",
    observeRootSelector: "#feed",
    itemSelector: ".item",
    uniqueKeyField: "title",
    fieldName: "title",
    fieldSelector: ".title",
  });
  await options.clickSave();
  await expect(page.getByText(serviceName)).toBeVisible();

  await options.clickEditByName(serviceName);
  await page.fill("#config-name", updatedName);
  await options.clickSave();
  await expect(page.getByText(updatedName)).toBeVisible();
  await expect(page.getByText(serviceName, { exact: true })).toHaveCount(0);

  await options.clickDeleteByName(updatedName);
  await options.confirmDelete();
  await expect(page.getByText(updatedName)).toHaveCount(0);
});
