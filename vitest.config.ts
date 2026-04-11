import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing";

const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

/** WXT 拡張のユニットテスト用（ストーリー・E2E は除外） */
const unitExclude = [
  "**/node_modules/**",
  "**/dist/**",
  "**/cypress/**",
  "**/.{idea,git,cache,output,temp}/**",
  "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
  "**/e2e/**",
  "**/playwright-report/**",
  "**/test-results/**",
  "**/*.stories.*",
  "**/*.mdx",
] as const;

/**
 * - `unit`: WXT 向け（`WxtVitest` はブラウザモードの Storybook テストと併用不可のためこのプロジェクトのみ）
 * - `storybook`: ストーリーベースのコンポーネント／a11y テスト（Chromium）
 * @see https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
 */
export default defineConfig({
  test: {
    projects: [
      {
        plugins: [WxtVitest()],
        test: {
          name: "unit",
          exclude: [...unitExclude],
        },
      },
      {
        plugins: [
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
            storybookScript: "pnpm storybook -- --no-open",
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
