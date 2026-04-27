# upstream との差分（正本）

[mizchi/skills の `playwright-test/SKILL.md`](https://github.com/mizchi/skills/blob/main/playwright-test/SKILL.md) との**意図的な差分**と、本リポジトリでの扱いの正本。

## upstream の固定参照

| 項目 | 値 |
| --- | --- |
| リポジトリ | `mizchi/skills` |
| パス | `playwright-test/SKILL.md` |
| raw | `https://raw.githubusercontent.com/mizchi/skills/main/playwright-test/SKILL.md` |
| 同期時点の `main` 先端コミット SHA | `a0ebf680f62836f64d7e9b741ee212f55b108f88` |

**再同期**: raw を再取得し API で `main` の `sha` を更新する。`SKILL.md` / `reference.md` / 本ファイルを変えたら、必要なら **E-xx** を追加する。

---

## 用語・環境のマッピング

| upstream の例 | 本リポジトリでの扱い |
| --- | --- |
| `npm ci` / `npx playwright` | [`reference.md`](reference.md) は **upstream のまま**（比較用原文）。実運用は **pnpm**（[`SKILL.md`](SKILL.md) の表と下記「Kansu 実装の参照」）。 |
| `testDir: './tests'` | [`reference.md`](reference.md) は upstream のまま。実リポジトリは **`./e2e`**（`playwright.config.ts`）。 |
| `node-version: 24` 等（YAML の固定値） | upstream サンプル内の固定値は参考用。Kansu の CI は **`.github/actions/setup-node-pnpm`** に従う。 |

---

## Kansu 実装の参照（抜粋）

[`reference.md`](reference.md) は upstream 原文のため、サンプル文言は書き換えない。リポジトリの事実は **ソースとワークフロー**が正本。ここは対応表と運用上の要点のみ。

### `playwright.config.ts`（要点）

リポジトリ直下のファイルが正本。例:

- `testDir: "./e2e"`
- `expect.timeout` は `./e2e/constants` の `E2E_STEP_TIMEOUT_MS`
- `reporter: "html"`
- `projects` は Chromium のみ（拡張 E2E）

### スクリプト（`package.json`）

| スクリプト | 内容 |
| --- | --- |
| `pnpm e2e` | `pnpm build` のあと `playwright test` |
| `pnpm e2e:only` | ビルドなしで `playwright test`（CI でビルド成果物を使うとき） |
| `pnpm e2e:watch` | ビルド後に UI モード |

ブラウザ取得の例: `pnpm exec playwright install chromium --with-deps`（メイン `ci` ジョブ）、`pnpm exec playwright install --with-deps`（`e2e` ジョブ）。

### GitHub Actions（方針）

- Node / pnpm のバージョンは **`.github/actions/setup-node-pnpm`** に従う。新規 YAML に `node-version` の固定数値だけを書かない。
- `ci.yml` の `e2e` ジョブ: ビルド成果物をダウンロード → `pnpm exec playwright install --with-deps` → `pnpm e2e:only`。
- `playwright.yml`: 手動 `workflow_dispatch` でビルド → ブラウザ取得 → `pnpm exec playwright test`。

---

## 本リポジトリでの差分（理由）

### E-01: ファイル分割

- **差分**: 運用本文を [`SKILL.md`](SKILL.md)、upstream 全文（frontmatter 除去）を [`reference.md`](reference.md)。
- **理由**: Cursor の Skill のオンデマンド読込と、再同期時に `reference.md` だけ差し替えて比較しやすくするため（[Cursor Docs — Agent Skills](https://cursor.com/docs/context/skills)）。

### E-02: `reference.md` の見出し

- **差分**: upstream で連続していた `###` / `##` の「Do Not Use Fixed Waits」を、**`##` 一本**に整理。
- **理由**: 同一内容の重複を避ける。

### E-03: Kansu 前提の明示（`SKILL.md`）

- **差分**: `e2e/`、`pnpm`、タイムアウト定数、設定の全面置換禁止などを [`SKILL.md`](SKILL.md) に記載。
- **理由**: upstream 汎用テンプレをそのまま当てる誤りを減らす。

### E-04: 補助ドキュメントの整理

- **差分**: `OVERVIEW-ja.md` や `reference-kansu.md` は **置かない**。Kansu 固有の対応表は本ファイル「Kansu 実装の参照」と `SKILL.md` の表に集約。
- **理由**: `SKILL.md` / `reference.md` / `upstream-divergences.md` の三層に統一し、[`reference.md`](reference.md) を常に upstream 比較用の原文として保つ。

### E-05: `reference.md` と本リポジトリ

- **差分**: [`reference.md`](reference.md) 内のコード・YAML は **upstream と同一**（`npm` / `npx` 表記含む）。本リポジトリ向けの書き換えは **`SKILL.md` の表と本ファイル**のみで行う。
- **理由**: 比較対象と実装の責務を分ける。
