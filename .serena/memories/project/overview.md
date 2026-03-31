# Kansu (infinite scroll archiver) — 概要

## 目的
ブラウザ拡張「Kansu（巻子）」。無限スクロールで読み込まれるページから、ユーザー定義ルール（CSSセレクタ等）に基づきデータを抽出し、IndexedDB に保存。検索・ソート・ページネーション・インポート/エクスポートを提供。データはローカルのみ（外部送信なし）。主要ターゲット: Google Chrome。

## 技術スタック（ルート `package.json` の依存に従う。バージョンは都度そこを参照）
- **拡張**: WXT 0.20.x + React 19 + TypeScript 5.8
- **UI**: Tailwind CSS 4, Radix Slot / shadcn 系コンポーネント（`src/components/ui`）, Lucide, Zustand, Dexie（IndexedDB）
- **品質**: Biome 2（format/lint/check）, markdownlint-cli2, Vitest 3, Playwright, Husky + lint-staged
- **パッケージマネージャー**: pnpm（`pnpm-lock.yaml`）

## コードベースの粗い構造
- `src/entrypoints/` — WXT エントリ（`background.ts`, `content.ts`, `popup/` に React UI）
- `src/lib/` — 共有ユーティリティ・ユニットテスト（例: `utils.ts`, `utils.test.ts`）
- `src/components/ui/` — UI プリミティブ（Button 等）
- `e2e/` — Playwright の E2E テスト
- `src/assets/` — スタイル・アセット
- `docs/` — 要件（`requirements.md`）、実装計画（`implementation_plan.md`）、実装ガイド（`implementation_guide.md`）
- ルート `Scratchpad.md` — AI 用の短期作業ログ
- `.serena/memories/` — AI 用の長期知識（教訓・規約・運用メモ）
- ルート: `biome.json`, `wxt.config.ts`（WXT 標準レイアウト）
- `README.md` — 開発者向けの入口（概要・主要コマンド・ドキュメント導線）

## 補足
- `package.json` の `name` は `kansu-infinite-scroll-archiver`（表示名・製品名は「Kansu」）。ライセンスはルート `LICENSE`（MIT）。
- Node の想定範囲は `engines.node`、pnpm の正は `packageManager`。GitHub Actions は `node-version-file: package.json` と `pnpm/action-setup`（`version` 省略で `packageManager` を参照）。

## 設計・ドキュメント
詳細は `docs/requirements.md` と `docs/implementation_plan.md` を参照。TDD（Vitest）と E2E（Playwright）を計画に含む。
