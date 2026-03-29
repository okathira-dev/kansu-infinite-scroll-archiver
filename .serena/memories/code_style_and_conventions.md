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
- `.cursor/rules/` — `global.mdc`（ルート `Scratchpad.md` と Serena メモリ運用）、`coding-rules.mdc`、`biome.mdc`、`repository.mdc` を参照
- ユーザー方針: 依頼範囲に集中した変更、無関係なリファクタを避ける、既存の命名・import スタイルに合わせる

## Cursor ルールと Serena メモリの役割（重複を避けるため）

- **Cursor ルール**（`.cursor/rules/*.mdc`）: Cursor がエージェントへ常時、またはファイル glob 一致時に注入する。Serena MCP を使わない会話でも効くため、ワークフロー全体（例: `global.mdc`）はここに置く。
- **Serena メモリ**（`.serena/memories/*.md`）: MCP の `list_memories` / `read_memory` で必要に応じて読む長期知識。会話開始時に全件が自動でコンテキストへ入るわけではない。
- **結論**: Serena を Cursor で使っていても **`.cursor/rules` は不要ではない**。一方、運用レッスンとコード規約を同一メモリにまとめ、チェック手順は `task_completion.md` に一本化して二重管理を避ける。

## AIエージェント運用メモ

### ユーザー指定・進め方
- ファイルを編集する前に、必ず対象ファイルの内容を確認する。
- 進捗管理（ToDo や `Scratchpad.md`）は実態に合わせて正確に更新する。
- 公式ドキュメントや公式サンプルを先に確認し、方針を優先する。
- ユーザーから明確な実装指示がない場合は、先に調査と計画を行い、承認後に実装する。

### 出力・デバッグ・データ
- 文字エンコーディングを含む入力（特に国際的なクエリ）では UTF-8 前提を崩さない。

### 日付・最新情報（エージェントの回答・Web検索時）
- 「現在年」を固定値で扱わず、ユーザーコンテキストの `Today's date` を優先して参照する。
- 最新情報の検索では、年指定が必要な場合にコンテキストに合わせた年を使う。

### 変更後の確認
- 手順の詳細は `task_completion.md` を参照（Biome / 型 / テスト / Markdown / E2E）。

## ドキュメント
- Markdown は markdownlint-cli2 でチェック（`pnpm lint-md`）
- **開発用ドキュメントに日付をメモしない**。経緯や順序が必要ならリストや本文で明示する（`docs/`、`Scratchpad.md`、本メモリ群、README、`.cursor` の説明など）。
