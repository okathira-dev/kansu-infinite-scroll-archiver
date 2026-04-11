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

## プロジェクト構成・実装規約
- 共有ロジックは `src/lib/` に配置し、UI層と責務を分離する。
- UIプリミティブは `src/components/ui/` に配置する。
- import/export は原則 `named` を使い、`default` は必要な場合に限定する。
- 依頼範囲に集中し、無関係なリファクタを混在させない。

## エージェント向け規約（正本は Cursor ルール）

- **本文は載せない**（二重管理と `read_memory` 時の無駄なトークンを避ける）。
- 言語・コロケーション・ドキュメント参照の詳細はリポジトリの `.cursor/rules/kansu-agent-conventions.mdc`（`alwaysApply: true`）を正本とする。Serena 利用時に確認したければ **当該 `.mdc` をファイル読取で開く**（メモリに同文を複製しない）。

## Cursor ルールと Serena メモリの役割

- **Cursor ルール**（`.cursor/rules/*.mdc`）: `alwaysApply: true` は**毎リクエスト**コンテキストに載るためトークン消費が増える。プロジェクト全体に効かせたい最小限だけ `alwaysApply` にし、それ以外は `globs` や手動 `@ルール` で絞るのが一般的（Cursor コミュニティ・解説記事でも「sparingly」とされる）。
- **Serena メモリ**（`.serena/memories/*.md`）: `read_memory` 等で読んだときだけその分がコンテキストに乗る。自動では全件注入されない。
- **結論**: 同じ規約の**全文**を両方に書かない。ワークフロー・エージェント規約の本文は `.cursor/rules`、Serena メモリは Biome 版情報・教訓・オンボーディング用など、ルールに無い補足に留める。

## 更新方針（Serena メモリ）

- メモリには **長期的に有効な知識**（規約、構成、運用上の教訓）のみを残す。
- 一時的な進捗・作業メモは `Scratchpad.md` で管理し、メモリに混在させない。
- 手順の重複を避け、最終チェック手順は `task_completion.md` に集約する。

### 変更後の確認
- 手順の詳細は `task_completion.md` を参照（Biome / 型 / テスト / Markdown / E2E）。

## ドキュメント
- Markdown は markdownlint-cli2 でチェック（`pnpm lint-md`）
- **開発用ドキュメントに日付をメモしない**。経緯や順序が必要ならリストや本文で明示する（`docs/`、`Scratchpad.md`、本メモリ群、README、`.cursor` の説明など）。
- **plan / guide は普遍的記述のみ、進捗は Scratchpad**、手順文の主語明示、WXT の `content.ts` と `content/index.ts` 併存禁止 … などセッションで固定した方針の**正本は** `.cursor/rules/kansu-agent-conventions.mdc` の「ドキュメントの役割分担」「WXT エントリ」を参照（本文の二重掲載はしない）。
