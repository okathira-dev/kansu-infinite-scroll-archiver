import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Playwright configuration for browser extension E2E testing
 * ブラウザ拡張機能のE2Eテスト設定
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',  // localhost でも 127.0.0.1 でも動作します

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium-extension",
      use: {
        ...devices["Desktop Chrome"],
        // Chrome extension specific settings
        // 🔧 channel: "chrome" について：
        // - 必須ではないが、ブラウザ拡張機能テストには強く推奨
        // - "chrome": 安定版のGoogle Chrome（推奨）
        // - 省略: Chromium（軽量だが、Chrome拡張機能のAPIが一部異なる可能性）
        // - その他: "chrome-beta", "chrome-dev", "chrome-canary"
        channel: "chrome", // 🔧 安定性のために推奨（必須ではない）
        // Extension will be loaded in setup
      },
    },

    // 🚫 ブラウザ拡張機能は Chrome/Chromium ベースのみサポート
    // Firefox, WebKit は Chrome Extension API をサポートしていないため無効化
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: "pnpm build",
  //   port: 3000,
  //   reuseExistingServer: !process.env.CI,
  // },
});
