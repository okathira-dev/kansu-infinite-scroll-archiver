# upstream との差分（正本）

[mizchi/skills の `playwright-test/SKILL.md`](https://github.com/mizchi/skills/blob/main/playwright-test/SKILL.md) を本リポジトリに取り込んだときの**意図的な差分**を記録する。

## upstream の固定参照

| 項目 | 値 |
| --- | --- |
| リポジトリ | `mizchi/skills` |
| パス | `playwright-test/SKILL.md` |
| raw | `https://raw.githubusercontent.com/mizchi/skills/main/playwright-test/SKILL.md` |
| 同期時点の `main` 先端コミット SHA | `a0ebf680f62836f64d7e9b741ee212f55b108f88` |

**再同期**: raw を再取得し API で `main` の `sha` を更新する。本文を変えたら本ファイルに **E-xx** を追加する。

---

## 用語・環境のマッピング

| upstream の例 | 本リポジトリでの扱い |
| --- | --- |
| `npm ci` / `npx playwright` | **pnpm** 前提（`pnpm install` / `pnpm exec playwright`）を `SKILL.md` の Kansu context に明記。`reference.md` 内のサンプルは upstream 原文のまま多く残す。 |
| `testDir: './tests'` | 本リポジトリは **`./e2e`**。テンプレは参考用。 |
| `node-version: 24` 等 | 実際の Node バージョンは **リポジトリの CI / Volta / package 方針**に従う（スキル本文で固定しない）。 |

---

## 変更エントリ

### E-01: ファイル分割（progressive disclosure）

- **upstream**: 単一 `SKILL.md` に設定テンプレ、Actions、ネットワーク、DnD など全文。
- **本リポジトリ**: 要約と Kansu 文脈を [`SKILL.md`](SKILL.md)、**本文ほぼ全文**を [`reference.md`](reference.md)（upstream から frontmatter 除去＋冒頭説明のみ追加）。
- **理由**: Cursor の Skill はリソースをオンデマンド読み込みしやすくするため（[Cursor Docs — Agent Skills](https://cursor.com/docs/context/skills)）。`SKILL.md` を 500 行未満に保つ方針。

### E-02: upstream 見出しの重複修正

- **upstream**: `### Rule: Do Not Use Fixed Waits` と `## Rule: Do Not Use Fixed Waits` が連続。
- **本リポジトリ**: `reference.md` では **`## Rule: Do Not Use Fixed Waits` 1本**に整理。
- **理由**: 同一節の重複を避ける。

### E-03: 日本語ドキュメントの分離

- **upstream**: 英語のみ。
- **本リポジトリ**: 人間向け日本語は [`OVERVIEW-ja.md`](OVERVIEW-ja.md)（Skill ディレクトリにコロケーション）。`SKILL.md` 先頭にリンク。
- **理由**: プロジェクト方針（英語 Skill 正本 + 人間向け日本語は Skill 同梱）。

### E-04: Kansu 固有の注意（`SKILL.md`）

- **upstream**: リポジトリ非依存の汎用テンプレ。
- **本リポジトリ**: `e2e/`、`pnpm` スクリプト、`e2e/constants.ts`、設定を丸ごと置換しない旨を `SKILL.md` に追記。
- **理由**: エージェントがテンプレをそのまま上書きする誤りを減らす。

### E-05: 人間向け日本語の置き場所（`docs/` → Skill 同梱）

- **以前**: `docs/agent-skills/playwright-test.md` に日本語ガイドを置いていた。
- **本リポジトリ**: 同内容を [`OVERVIEW-ja.md`](OVERVIEW-ja.md) に移し、`docs` 側のファイルは削除。
- **理由**: Skill 専用ドキュメントのコロケーション方針。

---

## 省略していないもの

- `reference.md` 内のコードブロック・YAML は **upstream と同一の英語・サンプル**を維持（npm 表記含む）。CI や実行コマンドをこのリポジトリに合わせる作業はタスクごとに行う。
