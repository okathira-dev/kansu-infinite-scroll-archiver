import type { Page } from "@playwright/test";

export async function openPopup(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await page.waitForSelector("#toggle-main-ui");

  const popup = {
    getToggleButton: () => page.waitForSelector("#toggle-main-ui"),
    getOptionsButton: () => page.waitForSelector("#open-options"),
    clickToggleMainUi: async () => {
      const button = await popup.getToggleButton();
      await button.click();
    },
    clickOpenOptions: async () => {
      const button = await popup.getOptionsButton();
      await button.click();
    },
    getStatusText: async () => {
      const status = await page.waitForSelector("#popup-status");
      return await status.evaluate((el) => el.textContent);
    },
  };
  return popup;
}
