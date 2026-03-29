# Kansu (巻子) — infinite scroll archiver

Kansu は、無限スクロール型ページからデータを抽出し、ローカル（IndexedDB）に保存して検索・整理するブラウザ拡張機能です。

## できること

- ユーザー定義ルール（CSS セレクタ等）に基づくデータ抽出
- IndexedDB への保存と検索・ソート・ページネーション
- データ/設定のインポート・エクスポート

## 前提環境

- Node.js
- pnpm
- Google Chrome（主要サポート対象）

## セットアップ

```bash
pnpm install
pnpm dev
```

## 開発コマンド

- `pnpm dev`: 開発モードを起動
- `pnpm build`: 本番ビルド
- `pnpm zip`: 拡張 ZIP を出力
- `pnpm check`: Biome の format/lint/check を実行
- `pnpm compile`: TypeScript の型チェック
- `pnpm test`: Vitest のユニットテストを実行
- `pnpm e2e`: Playwright の E2E テストを実行
- `pnpm lint-md`: Markdown の lint を実行

## 依存関係の更新

バージョンの正は `package.json` と `pnpm-lock.yaml` とする。

1. `pnpm outdated` で差分を確認する。
2. メジャーアップは各パッケージの CHANGELOG / マイグレーションガイドを読んでから行う。
3. 範囲内だけ更新する場合は `pnpm update`。`package.json` の版を上げる場合は `pnpm dlx npm-check-updates` 等でもよい。
4. `@biomejs/biome` を上げたら `biome.json` の `$schema` を同じ版に合わせる。Tailwind v4 構文を使う CSS がある場合は `css.parser.tailwindDirectives` の要否を確認する。
5. `@playwright/test` を上げたら `pnpm exec playwright install`（CI と同様に `--with-deps` が必要な環境もある）。
6. 変更後は少なくとも `pnpm check` / `pnpm compile` / `pnpm test` / `pnpm build` / `pnpm e2e` / `pnpm lint-md` を通す。

## ディレクトリ構成（抜粋）

- `src/entrypoints/`: WXT エントリーポイント
- `src/lib/`: 共有ロジック・ユーティリティ
- `src/components/ui/`: 再利用 UI コンポーネント
- `docs/`: 要件・実装計画・実装ガイド
- `e2e/`: Playwright の E2E テスト

## ドキュメント

- [要件定義](docs/requirements.md)
- [実装計画](docs/implementation_plan.md)
- [実装ガイド](docs/implementation_guide.md)

## 開発時の参照順

1. `docs/requirements.md` で要件を確認
2. `docs/implementation_plan.md` で実装方針を確認
3. `docs/implementation_guide.md` で技術仕様を確認
