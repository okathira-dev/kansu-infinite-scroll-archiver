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
