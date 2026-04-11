import type { ServiceConfig } from "@/lib/types";

/**
 * 開発デバッグ専用の fixture 設定。
 *
 * テスト・手動デバッグのためだけに実装側へ置きたくないが、本番バンドルに含まれないなら例外的に置く、という位置づけ。
 * `background.ts` の `import.meta.env.DEV` ガード内でのみ参照すること。
 * Vite は `import.meta.env` をビルド時に静的置換し tree-shaking する（https://vite.dev/guide/env-and-mode.html ）。
 * 本番では DEV が偽に置換され参照が消えるため、このモジュールもバンドルに含まれない想定。
 */
export const manualFixtureServiceId = "service-e2e-manual";

/**
 * 固定 fixture ページ向けの初期設定を返す。
 *
 * 開発時のみ自動投入し、手動デバッグの初期セットアップを短縮する。
 */
export const createManualFixtureServiceConfig = (): ServiceConfig => ({
  id: manualFixtureServiceId,
  name: "E2E Manual Fixture",
  // `*` は `urlPatternMatcher` で `.*` 扱いのため、fixture サーバのポートに依存しない。
  urlPatterns: ["http://127.0.0.1:*/kansu-e2e/*"],
  observeRootSelector: "#feed",
  itemSelector: ".item",
  uniqueKeyField: "link",
  fieldRules: [
    { name: "link", selector: ".link", type: "linkUrl" },
    { name: "title", selector: ".title", type: "text" },
    { name: "thumbnail", selector: ".thumb", type: "imageUrl" },
    { name: "digits", selector: ".title", type: "regex", regex: "(\\d+)" },
  ],
  enabled: true,
  updatedAt: new Date().toISOString(),
});
