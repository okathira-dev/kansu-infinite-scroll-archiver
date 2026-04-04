import type { Page } from "@playwright/test";

export async function openOptionsPage(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/options.html`);
  await page.waitForSelector("text=Kansu 設定");

  return {
    clickNewConfig: async () => {
      await page.click("#new-config");
    },
    fillConfigForm: async (params: {
      id: string;
      name: string;
      urlPatternsText: string;
      observeRootSelector: string;
      itemSelector: string;
      uniqueKeyField: string;
      fieldName: string;
      fieldSelector: string;
    }) => {
      await page.fill("#config-name", params.name);
      await page.fill("#config-id", params.id);
      await page.fill("#config-url-patterns", params.urlPatternsText);
      await page.fill("#config-observe-root", params.observeRootSelector);
      await page.fill("#config-item-selector", params.itemSelector);
      await page.fill("input[aria-label='field-name-1']", params.fieldName);
      await page.fill("input[aria-label='field-selector-1']", params.fieldSelector);
      await page.click("#config-unique-key");
      await page.getByRole("option", { name: params.uniqueKeyField }).click();
    },
    clickSave: async () => {
      await page.click("#save-config");
    },
    clickDeleteByName: async (name: string) => {
      const card = page.locator("[data-slot='card']").filter({ hasText: name }).first();
      await card.getByRole("button", { name: "削除" }).click();
    },
    confirmDelete: async () => {
      await page.click("#confirm-delete-config");
    },
  };
}
