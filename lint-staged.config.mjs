/**
 * lint-staged の設定。
 * `tsc` は CLI にファイルパスを渡すと TS 6 で tsconfig を読まず失敗するため、
 * プロジェクト全体の `tsc --noEmit` は関数で実行する（lint-staged がパスを付与しない）。
 */
export default {
  "*.{ts,tsx,js,jsx,mjs,cjs}": ["biome check", () => "tsc --noEmit"],
  "*.{md,mdx,mdc}": "markdownlint-cli2",
};
