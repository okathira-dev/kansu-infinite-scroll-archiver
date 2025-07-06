import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing";

export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    // E2Eテストを除外
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      "**/e2e/**", // E2Eテストディレクトリを除外
      "**/playwright-report/**",
      "**/test-results/**",
    ],
    // IndexedDBのモック設定
    setupFiles: ["./src/test/setup.ts"],
    environment: "happy-dom",
  },
});
