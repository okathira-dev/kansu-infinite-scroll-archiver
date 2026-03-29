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

## Cursor ルールと Serena メモリの役割（重複を避けるため）

- **Cursor ルール**（`.cursor/rules/*.mdc`）: Cursor がエージェントへ常時、またはファイル glob 一致時に注入する。Serena MCP を使わない会話でも効くため、ワークフロー全体（例: `global.mdc`）はここに置く。
- **Serena メモリ**（`.serena/memories/*.md`）: MCP の `list_memories` / `read_memory` で必要に応じて読む長期知識。会話開始時に全件が自動でコンテキストへ入るわけではない。
- **結論**: Serena を Cursor で使う場合でも、運用ルールは `.cursor/rules`、長期知識は `.serena/memories` に分離して管理する。

## 更新方針（Serena メモリ）

- メモリには **長期的に有効な知識**（規約、構成、運用上の教訓）のみを残す。
- 一時的な進捗・作業メモは `Scratchpad.md` で管理し、メモリに混在させない。
- 手順の重複を避け、最終チェック手順は `task_completion.md` に集約する。

### 変更後の確認
- 手順の詳細は `task_completion.md` を参照（Biome / 型 / テスト / Markdown / E2E）。

## ドキュメント
- Markdown は markdownlint-cli2 でチェック（`pnpm lint-md`）
- **開発用ドキュメントに日付をメモしない**。経緯や順序が必要ならリストや本文で明示する（`docs/`、`Scratchpad.md`、本メモリ群、README、`.cursor` の説明など）。
