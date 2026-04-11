import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

const shouldOpenFixture = process.env.KANSU_DEV_OPEN_FIXTURE === "1";
const fixturePort = process.env.FIXTURE_PORT ?? "41731";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  ...(shouldOpenFixture
    ? {
        // `pnpm dev` / `pnpm dev:firefox` からのみ付与するフラグで fixture URL を開く。
        webExt: {
          startUrls: [`http://127.0.0.1:${fixturePort}/kansu-e2e/infinite-scroll`],
        },
      }
    : {}),
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }),
});
