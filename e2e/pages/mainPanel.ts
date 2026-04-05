import type { Page } from "@playwright/test";
import { E2E_STEP_TIMEOUT_MS } from "../constants";

export async function waitForMainPanel(page: Page) {
  await page.waitForSelector("#kansu-main-panel", { timeout: E2E_STEP_TIMEOUT_MS });
  return {
    getPanel: () => page.locator("#kansu-main-panel"),
    fillKeyword: async (keyword: string) => {
      await page.fill("#kansu-search-input", keyword);
    },
    clickSortBy: async (fieldName: string) => {
      const panel = page.locator("#kansu-main-panel");
      await panel
        .getByRole("button", { name: new RegExp(fieldName) })
        .first()
        .click();
    },
    goToNextPage: async () => {
      await page.click("#kansu-next-page");
    },
    goToPrevPage: async () => {
      await page.click("#kansu-prev-page");
    },
  };
}
