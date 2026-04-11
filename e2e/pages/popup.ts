import type { Page } from "@playwright/test";
import { E2E_STEP_TIMEOUT_MS } from "../constants";

export async function openPopup(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await page.waitForSelector("#toggle-main-ui", { timeout: E2E_STEP_TIMEOUT_MS });

  const popup = {
    getToggleButton: () =>
      page.waitForSelector("#toggle-main-ui", { timeout: E2E_STEP_TIMEOUT_MS }),
    getOptionsButton: () => page.waitForSelector("#open-options", { timeout: E2E_STEP_TIMEOUT_MS }),
    clickToggleMainUi: async () => {
      const button = await popup.getToggleButton();
      await button.click();
    },
    clickOpenOptions: async () => {
      const button = await popup.getOptionsButton();
      await button.click();
    },
    getStatusText: async () => {
      const status = await page.waitForSelector("#popup-status", { timeout: E2E_STEP_TIMEOUT_MS });
      return await status.evaluate((el) => el.textContent);
    },
  };
  return popup;
}
