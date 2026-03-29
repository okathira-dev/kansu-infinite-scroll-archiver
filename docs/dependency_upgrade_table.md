# 依存パッケージ更新表（バージョン上げ準備用）

この表は **npm レジストリの `latest` タグ**（および Vite 連動などの**互換性上の現実的な上限**）を基準にしたものです。作業前に必ず `pnpm outdated` とリリースノートで再確認してください。`pnpm` の safe-chain 等により、表示される「最新」が一時的に抑止される場合があります。

## 調査・更新の手順

1. `pnpm outdated` で差分を確認する。
2. メジャーアップは該当パッケージの CHANGELOG / マイグレーションガイドを読む。
3. `pnpm install` 後に `pnpm check`、`pnpm compile`、`pnpm test`、`pnpm build`、`pnpm e2e` を順に通す。
4. Playwright を上げた場合は `pnpm exec playwright install` を再実行する。
5. Biome を上げた場合は `biome.json` の `$schema` バージョンと推奨設定の差分を確認する。

## 現在の解決バージョン（参考）

`pnpm why vite` より、このリポジトリでは **Vite 6.3.x** が解決されている。`@vitejs/plugin-react` の **6.x** は **Vite ^8.0.0** 前提のため、`latest` が 6.x でも即座には上げられない。

## dependencies

| パッケージ | package.json 指定 | npm `latest` | 備考 |
| --- | --- | --- | --- |
| `@radix-ui/react-slot` | ^1.2.3 | 1.2.4 | マイナー。Shadcn 系と併せて更新可。 |
| `@tailwindcss/vite` | ^4.1.11 | 4.2.2 | Tailwind と同時更新推奨。 |
| `class-variance-authority` | ^0.7.1 | 0.7.1 | 既に latest。 |
| `clsx` | ^2.1.1 | 2.1.1 | 既に latest。 |
| `dexie` | ^4.0.11 | 4.4.1 | マイナー。IndexedDB API 周りのリリースノート確認。 |
| `lucide-react` | ^0.525.0 | **1.7.0** | **メジャー（0.x → 1.x）**。アイコン名・バンドルサイズ・import パス等の変更要確認。 |
| `react` | ^19.1.0 | 19.2.4 | マイナー。`react-dom` と同版に揃える。 |
| `react-dom` | ^19.1.0 | 19.2.4 | 同上。 |
| `tailwind-merge` | ^3.3.1 | 3.5.0 | マイナー。 |
| `tailwindcss` | ^4.1.11 | 4.2.2 | `@tailwindcss/vite` と同時が無難。 |
| `zustand` | ^5.0.6 | 5.0.12 | マイナー。 |

## devDependencies

| パッケージ | package.json 指定 | npm `latest` | 備考 |
| --- | --- | --- | --- |
| `@biomejs/biome` | 2.0.6（ピン） | 2.4.9 | `biome.json` の `$schema` 更新・ルール差分確認。 |
| `@playwright/test` | ^1.53.2 | 1.58.2 | ブラウザバイナリ再取得が必要。 |
| `@types/node` | ^24.0.7 | **25.5.0** | **メジャー**。ローカル/CI の Node 方針（現状 20）と型の整合を取る。 |
| `@types/react` | ^19.1.2 | 19.2.14 | `react` 19.2 系へ合わせて更新可。 |
| `@types/react-dom` | ^19.1.3 | 19.2.3 | 同上。 |
| `@vitejs/plugin-react` | ^4.6.0 | **6.0.1**（要 Vite 8） | **latest の 6.x は未対応**。Vite 6 のままなら **4.7.0**（peer: Vite 4–7）または **5.2.0**（peer に Vite 6 含む）を検討。WXT・`@wxt-dev/module-react` の peer と併せて判断。 |
| `@wxt-dev/module-react` | ^1.1.3 | 1.2.2 | WXT / Vite / `@vitejs/plugin-react` とセットで確認。 |
| `husky` | ^9.1.7 | 9.1.7 | 既に latest。 |
| `lint-staged` | ^16.1.2 | 16.4.0 | マイナー。 |
| `markdownlint-cli2` | ^0.18.1 | 0.22.0 | ルール・設定変更の有無を確認。 |
| `tw-animate-css` | ^1.3.4 | 1.4.0 | マイナー。 |
| `typescript` | ^5.8.3 | **6.0.2** | **メジャー**。Biome・WXT・Vitest との互換を確認してから。 |
| `vitest` | ^3.2.4 | **4.1.2** | **メジャー**。peer の `vite` は ^6・^7・^8 を含むため Vite 6 とは両立しうる。設定ファイル・API の移行ガイド必読。 |
| `wxt` | ^0.20.6 | 0.20.20 | パッチ/マイナー。`postinstall` の `wxt prepare` 後に差分確認。 |

## 推奨バッチ（目安）

実際の順序は CHANGELOG と CI の結果で調整すること。

| バッチ | 対象の例 | 注意点 |
| --- | --- | --- |
| A（低リスク） | `radix-ui`、`zustand`、`dexie`、`tailwind-merge`、React 19.2 系、`@types/react*` | 小さくまとめて `check` / `test` / `build`。 |
| B（ツールチェーン） | `wxt`、`@wxt-dev/module-react`、`@tailwindcss/vite`、`tailwindcss` | ビルド・HMR・拡張読み込みを重点確認。 |
| C（品質・E2E） | `@biomejs/biome`、`markdownlint-cli2`、`lint-staged`、`@playwright/test` | Biome は schema とルール。Playwright は `install`。 |
| D（テストランナー） | `vitest` 3 → 4 | マイグレーションガイドに従い、`vitest.config.ts` と WXT 連携を確認。 |
| E（型・実行時） | `typescript` 5 → 6、`@types/node` 24 → 25 | CI の Node バージョンと揃える。単独ブランチ推奨。 |
| F（破壊的の可能性大） | `lucide-react` 0.x → 1.x | アイコン利用箇所の一括確認。 |
| G（Vite メジャー連動） | Vite 8 へ上がった後の `@vitejs/plugin-react` 6.x | WXT が Vite 8 を正式サポートしてから。 |

## 関連ドキュメント

- [implementation_guide.md](./implementation_guide.md)（技術スタックの前提）
- プロジェクトルートの `package.json` / `pnpm-lock.yaml`
