# 開発でよく使うコマンド（Windows / PowerShell）

前提: リポジトリルートで実行。パッケージマネージャは **pnpm**（`pnpm-lock.yaml` あり）。

## 依存関係
- `pnpm install` — 依存インストール（postinstall で `wxt prepare`）
- 初回のみ E2E でブラウザが必要な場合: `pnpm exec playwright install`（または CI と同様の依存に合わせる）

## 実行・ビルド
- `pnpm dev` — fixture + Chrome 拡張（`FIXTURE_PORT` でポート指定、未設定は 41731）
- `pnpm dev:firefox` — 同上で Firefox
- `pnpm dev:extension` — 拡張のみ（Chrome）
- `pnpm dev:extension:firefox` — 拡張のみ（Firefox）
- `pnpm build` / `pnpm build:firefox` — 本番ビルド
- `pnpm zip` / `pnpm zip:firefox` — 拡張 ZIP 出力

## 型チェック
- `pnpm compile` — `tsc --noEmit`

## Lint / フォーマット（Biome）
- `pnpm check` — format + lint まとめて確認
- `pnpm check:fix` — 自動修正
- `pnpm format` / `pnpm format:fix`
- `pnpm lint` / `pnpm lint:fix`

## Markdown
- `pnpm lint-md` / `pnpm lint-md:fix`

## テスト
- `pnpm test` — Vitest 一回実行
- `pnpm test:watch` — ウォッチ
- `pnpm e2e` — Playwright
- `pnpm e2e:watch` — Playwright UI

## Git など（Windows）
- `git status`, `git diff` — 変更確認
- ファイル検索: PowerShell では `Get-ChildItem -Recurse` やエディタ / ripgrep 相当ツール
- パス区切り: `\` または引用付きパスで `/` も可な場合あり

## Husky / lint-staged
コミット時に TS/JS は `biome check`、md は markdownlint が走る（`package.json` の `lint-staged`）。
