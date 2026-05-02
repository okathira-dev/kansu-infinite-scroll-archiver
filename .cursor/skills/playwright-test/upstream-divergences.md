# upstream との差分（正本）

[mizchi/skills の `playwright-test/SKILL.md`](https://github.com/mizchi/skills/blob/main/playwright-test/SKILL.md) との**意図的な差分**と、本リポジトリでの扱いの正本。

## upstream の固定参照

| 項目 | 値 |
| --- | --- |
| リポジトリ | `mizchi/skills` |
| パス | `playwright-test/SKILL.md` |
| raw | `https://raw.githubusercontent.com/mizchi/skills/main/playwright-test/SKILL.md` |
| 同期時点の `main` 先端コミット SHA | `a0ebf680f62836f64d7e9b741ee212f55b108f88` |

**再同期**: raw を再取得し、`main` の `sha` を上表に反映する。[`SKILL.md`](SKILL.md) / [`references/original.md`](references/original.md) / 本ファイルを追随したら、下記「現在の意図的差分」がまだ正しいか確認し、変わった点だけ更新する（履歴番号の列挙は不要）。

---

## 用語・環境のマッピング

| upstream の例 | 本リポジトリでの扱い |
| --- | --- |
| `npm ci` / `npx playwright` | [`references/original.md`](references/original.md) は **upstream のまま**（比較用原文）。実運用は **pnpm**（[`SKILL.md`](SKILL.md) の表と「Kansu 実装の参照」）。 |
| `testDir: './tests'` | [`references/original.md`](references/original.md) は upstream のまま。実リポジトリは **`./e2e`**（`playwright.config.ts`）。 |
| `node-version: 24` 等（YAML の固定値） | upstream サンプル内の固定値は参考用。Kansu の CI は **`.github/actions/setup-node-pnpm`** に従う。 |

---

## Kansu 実装の参照（抜粋）

[`references/original.md`](references/original.md) は upstream 原文のため、サンプル文言は書き換えない。リポジトリの事実は **ソースとワークフロー**が正本。

### `playwright.config.ts`（要点）

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

## 現在の意図的差分（一覧）

| 観点 | 本リポジトリの方針 |
| --- | --- |
| ファイル役割 | [`SKILL.md`](SKILL.md) = 運用・Kansu 前提・最小読みパス。[`references/original.md`](references/original.md) = upstream 全文（frontmatter 除去）の比較用。[Cursor Agent Skills ドキュメント](https://cursor.com/docs/context/skills) に沿ったオンデマンド読込。 |
| `references/original.md` の見出し | upstream で重複していた「Do Not Use Fixed Waits」を **`##` 一本**に整理（同一内容の重複排除）。 |
| 本文とリポジトリ事実 | original 内のコード・YAML は **upstream と同一**（`npm` / `npx` 含む）。Kansu 向けの書き換えは **SKILL.md の表・本ファイル・ソース**のみ。 |
| Kansu 前提（SKILL.md） | `e2e/`、`pnpm`、タイムアウト定数、`playwright.config.ts` の全面テンプレ置換禁止、などを明示。 |
| 補助ファイル | `OVERVIEW-ja.md` / `reference-kansu.md` は置かず、対応表は本ファイルと SKILL.md に集約。 |
| 最小読み取り | SKILL.md に **Minimal reading path**（用途別に `references/original.md` の見出しへジャンプ、デフォルトは全読しない）。 |
| frontmatter `description` | 「Playwright テストの作成/変更、または Playwright 関連 CI 設定の変更」に限定し、トリガー過多を避ける。 |
