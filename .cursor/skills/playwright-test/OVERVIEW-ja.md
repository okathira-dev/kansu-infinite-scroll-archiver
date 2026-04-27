# playwright-test（Playwright Test）— 利用ガイド（日本語）

このファイルは **人間向け** の説明である（Skill ディレクトリにコロケーション）。エージェント向けの**英語本文**（mizchi upstream 準拠）は次を正とする。

- [SKILL.md](SKILL.md) — いつ使うか・Kansu 文脈・非交渉ルールの要約
- [reference.md](reference.md) — 設定テンプレ、GitHub Actions、シャーディング、ネットワーク、DnD、ロケーター等の**全文リファレンス**
- [upstream-divergences.md](upstream-divergences.md) — upstream との差分

## この Skill でできること

Playwright Test の **E2E の書き方・レビュー・CI 設計**を支援する。固定待機の禁止、web-first アサーション、`waitForResponse` の順序、Linux CI のフォント、シャードと `merge-reports` など、[mizchi/skills の playwright-test](https://github.com/mizchi/skills/tree/main/playwright-test) と同じベストプラクティス集である。

## Kansu リポジトリで押さえること

| 項目 | 内容 |
| --- | --- |
| テストの場所 | **`e2e/`**（`playwright.config.ts` の `testDir`） |
| 実行 | **`pnpm e2e`**（ビルド込み）、**`pnpm e2e:only`**（テストのみ）、**`pnpm e2e:watch`**（UI） |
| タイムアウト | **`e2e/constants.ts`**（例: `E2E_STEP_TIMEOUT_MS`）と `playwright.config.ts` の `expect.timeout` が関連している。新規テストではここに揃える |
| パッケージマネージャ | **pnpm**。ドキュメントや CI スニペットを書き換えるときは `npm` / `npx` を機械的に置換しないよう注意（`reference.md` 内の upstream サンプルは `npm` のまま残っている） |
| 設定のマージ | `reference.md` の `playwright.config.ts` 例は **テンプレート**。既存の `defineConfig` を**タスク指示なしに全面置換しない**（`SKILL.md` にも明記） |

## いつ参照させるか

- 新規 `e2e/*.spec.ts` や Page Object を書く・レビューするとき
- フレーキーやタイムアウトを直すとき
- GitHub Actions の E2E を増やす・シャードする・レポーターを変えるとき

## upstream の更新

`upstream-divergences.md` の SHA を更新し、`reference.md` を英語側で差分取り込みする。運用上の注意の追記が必要なら **本ファイル（`OVERVIEW-ja.md`）** だけ更新すればよい。

## 調査メモ

[mizchi-skills 調査メモ](../../../docs/agent-skills/mizchi-skills-survey.md)
