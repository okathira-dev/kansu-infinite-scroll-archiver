# コードスタイルと規約

## Biome（`biome.json`、@biomejs/biome 2.0.6 スキーマ）
- インデント: スペース 2、行幅 100
- JavaScript/TS: **ダブルクォート**、**セミコロン必須**
- Linter: `recommended` 有効
- `organizeImports`: on（assist）
- VCS: git、`main` が default branch、`.gitignore` 尊重、`ignoreUnknown` ファイルは無視

## 言語・フレームワーク
- TypeScript strict 運用（プロジェクトの `tsconfig` に従う）
- React 19 + WXT: エントリは `src/entrypoints/` 配下の WXT 規約に従う

## プロジェクト固有ルール（Cursor）
- `.cursor/rules/` — `global.mdc`（Scratchpad/Lessons）、`coding-rules.mdc` などを参照
- ユーザー方針: 依頼範囲に集中した変更、無関係なリファクタを避ける、既存の命名・import スタイルに合わせる

## ドキュメント
- Markdown は markdownlint-cli2 でチェック（`pnpm lint-md`）
