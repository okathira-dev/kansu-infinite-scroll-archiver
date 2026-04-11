import { readFile } from "node:fs/promises";
import { E2E_BACKGROUND_SYNC_TIMEOUT_MS, E2E_STEP_TIMEOUT_MS } from "./constants";
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

// Phase 5: `data/export` で得た JSON をそのまま `data/import` し、設定が復元されること（AC-05 相当）
test("Options: JSON のエクスポートとインポートができる", async ({ page, extensionId }) => {
  const options = await openOptionsPage(page, extensionId);
  const serviceId = `service-e2e-import-export-${Date.now()}`;
  const serviceName = `E2E ImportExport ${Date.now()}`;

  await options.clickNewConfig();
  await options.fillConfigForm({
    id: serviceId,
    name: serviceName,
    urlPatternsText: "https://example.com/kansu-e2e-import/*",
    observeRootSelector: "#feed",
    itemSelector: ".item",
    uniqueKeyField: "title",
    fieldName: "title",
    fieldSelector: ".title",
  });
  await options.clickSave();
  await expect(page.getByText(serviceName)).toBeVisible();

  await options.openGlobalSettingsTab();
  const downloadPromise = page.waitForEvent("download", { timeout: E2E_STEP_TIMEOUT_MS });
  await options.clickExportServiceData();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  const exportedText = await readFile(downloadPath as string, "utf8");
  const exportedPayload = JSON.parse(exportedText) as {
    service: { id: string; name: string };
  };
  expect(exportedPayload.service.id).toBe(serviceId);
  expect(exportedPayload.service.name).toBe(serviceName);

  await options.openServiceSettingsTab();
  await options.clickDeleteByName(serviceName);
  await options.confirmDelete();
  await expect(page.getByText(serviceName)).toHaveCount(0);

  await options.openGlobalSettingsTab();
  await options.setImportJsonFile({
    name: `${serviceId}.json`,
    mimeType: "application/json",
    buffer: Buffer.from(exportedText),
  });
  await options.clickImportServiceData();
  await expect(page.getByText(/インポートしました/)).toBeVisible({
    timeout: E2E_BACKGROUND_SYNC_TIMEOUT_MS,
  });

  await options.openServiceSettingsTab();
  await expect(page.getByText(serviceName)).toBeVisible();
});
