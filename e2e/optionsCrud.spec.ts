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
