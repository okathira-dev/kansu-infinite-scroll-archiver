# Kansu (巻子) — infinite scroll archiver

Kansu は、無限スクロール型ページからデータを抽出し、ローカル（IndexedDB）に保存して検索・整理するブラウザ拡張機能です。

## できること

- ユーザー定義ルール（CSS セレクタ等）に基づくデータ抽出
- IndexedDB への保存と検索・ソート・ページネーション
- データ/設定のインポート・エクスポート

## 前提環境

- Node.js（`package.json` の `engines.node`。CI の `actions/setup-node` も同フィールドを参照）
- pnpm（`package.json` の `packageManager`。Corepack 利用時は `corepack enable` 後にバージョンが揃う）
- CI のセットアップは `.github/actions/setup-node-pnpm` に集約（Node は `engines.node`、pnpm は `packageManager` を参照）。
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
- `pnpm e2e`: `pnpm build` のあと Playwright の E2E を実行（`.output/chrome-mv3` の取り違え防止）
- `pnpm e2e:watch`: 同上のあと Playwright UI モード
- `pnpm e2e:only`: ビルドなしで E2E のみ（直前にビルド済みのとき／CI でアーティファクトを展開したあと）
- `pnpm lint-md`: Markdown の lint を実行
- `pnpm storybook`: Storybook（UI カタログ）を起動
- `pnpm build-storybook`: Storybook の静的ビルドを生成

拡張本体の動作確認は `pnpm dev`、デザイン確認は `pnpm storybook` を使い分ける。

### 開発時デバッグの注意点（要点）

- `runtime.sendMessage` の手動テストは、Service Worker ではなく Popup / Content / Options 側のコンソールから送る（SW コンソールからは受信先不在エラーになることがある）。
- IndexedDB（`kansu-archive`）の確認は Popup/Options 側の DevTools の `Application > IndexedDB` を優先する（SW 側では `No IndexedDB detected` と表示される場合がある）。
- Service Worker の DevTools は、受信ログ・例外確認・ライフサイクル挙動の確認用途として使う。
- 詳細手順は [WXT 開発モードのデバッグ・動作確認](docs/wxt-dev-debug.md) を参照。

## 依存関係の更新

バージョンの正本は `package.json` と `pnpm-lock.yaml` とする。

1. `pnpm outdated` で差分を確認する。
2. メジャーアップは各パッケージの CHANGELOG / マイグレーションガイドを読んでから行う。
3. 範囲内だけ更新する場合は `pnpm update`。`package.json` の版を上げる場合は `pnpm dlx npm-check-updates` 等でもよい。
4. `@biomejs/biome` を上げたら `biome.json` の `$schema` を同じ版に合わせる。Tailwind v4 構文を使う CSS がある場合は `css.parser.tailwindDirectives` の要否を確認する。
5. `@playwright/test` を上げたら `pnpm exec playwright install`（CI と同様に `--with-deps` が必要な環境もある）。
6. 変更後は少なくとも `pnpm check` / `pnpm compile` / `pnpm test` / `pnpm build` / `pnpm e2e` / `pnpm lint-md` を通す。

## サプライチェーン対策

- GitHub Actions の外部 `uses:` はタグではなくフル SHA で固定する
- 依存インストール時の検疫として `pnpm-workspace.yaml` の `minimumReleaseAge: 4320`（3日）を有効化している。
- Dependabot は `.github/dependabot.yml` で `npm` と `github-actions` の両方に `cooldown: 3 days` を設定している。
- CI の依存取得は `.github/actions/setup-node-pnpm` 内で Takumi Guard（匿名モード）を有効化してから `pnpm install` を実行する。

### Actions の更新ルール

- `uses: owner/repo@<40桁SHA>` のみで指定する。リリース名は各リポジトリ上でコミット SHA から辿る。

## ディレクトリ構成（抜粋）

- `src/entrypoints/`: WXT エントリーポイント
- `src/lib/`: 共有ロジック・ユーティリティ
- `src/components/ui/`: 再利用 UI コンポーネント
- `docs/`: 要件・実装計画・実装ガイド・ストレージ設計
- `e2e/`: Playwright の E2E テスト

## ドキュメント

- [プライバシーポリシー](store/privacy-policy.md)（Chrome Web Store 提出時は [GitHub 上の表示 URL](https://github.com/okathira-dev/kansu-infinite-scroll-archiver/blob/main/store/privacy-policy.md) をポリシー URL に指定可能）
- [要件定義](docs/requirements.md)
- [実装計画](docs/implementation_plan.md)
- [実装ガイド](docs/implementation_guide.md)
- [WXT 開発モードのデバッグ・動作確認](docs/wxt-dev-debug.md)
- [ストレージと DB 設計](docs/storage-and-db-design.md)

## 開発時の参照順

1. `docs/requirements.md` で要件を確認
2. `docs/implementation_plan.md` で実装方針を確認
3. `docs/implementation_guide.md` で技術仕様を確認
