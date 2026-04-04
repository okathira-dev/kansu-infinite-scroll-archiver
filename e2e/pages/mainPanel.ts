import type { Page } from "@playwright/test";

export async function waitForMainPanel(page: Page) {
  await page.waitForSelector("#kansu-main-panel");
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
