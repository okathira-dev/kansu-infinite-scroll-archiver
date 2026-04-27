# empirical-prompt-tuning（実証的プロンプト調整）— 利用ガイド（日本語）

このファイルは **人間向け** の説明である（Skill ディレクトリにコロケーション）。エージェント向けの指示本文（英語・mizchi 原文準拠）は次を正とする。

- [SKILL.md](SKILL.md) — ワークフロー要約
- [reference.md](reference.md) — テンプレート・表・停止条件など全文
- [upstream-divergences.md](upstream-divergences.md) — 本リポジトリで upstream から変えた点の一覧

[mizchi/skills](https://github.com/mizchi/skills) では各 Skill の **`SKILL.md` が英語**で提供されている。本プロジェクトでも **その英語本文をエージェント向けの正**として使い、ユーザーが読みやすい説明は **この `OVERVIEW-ja.md`** に書く。

## 何をする Skill か

指示文（Skill、`.mdc`、CLAUDE.md、コード生成プロンプトなど）の作者は、自分の文章を客観的に評価しにくい。**別の実行者（新規サブエージェント）** に実際に実行させ、自己報告とチェックリストで **両面から評価**し、最小修正を繰り返して品質を上げる手法である。upstream の思想は [mizchi/skills の `empirical-prompt-tuning`](https://github.com/mizchi/skills/tree/main/empirical-prompt-tuning) と同じ。

## いつ使うか（要約）

- Skill やルールを **作った直後・大きく直した直後**
- エージェントの挙動がおかしい原因が **指示の曖昧さ** にありそうなとき
- **よく使う**指示を堅牢化したいとき

使い捨ての一回きりや、「好みの文体」だけを直したい場合はコストに見合わない。

## ファイルの役割

| ファイル | 言語 | 役割 |
| --- | --- | --- |
| `SKILL.md` | 英語 | エージェントが従う手順の核（upstream に沿った文体） |
| `reference.md` | 英語 | コピー用テンプレ、評価軸、台帳、収束条件、レッドフラグ |
| `upstream-divergences.md` | 日本語 | upstream との差分の正本（保守・監査用） |
| `OVERVIEW-ja.md`（本ファイル） | 日本語 | 人間向けの全体像と運用上の注意 |

## ワークフロー（日本語の地図）

詳細は `SKILL.md` の見出しどおり。ここでは流れだけ示す。

1. **Iteration 0**: `description` と本文の範囲が一致しているか **静的に** 確認（ここを飛ばすと偽陽性になりやすい）。
2. **準備**: 評価シナリオ 2〜3 種、各シナリオの要件チェックリスト（3〜7 項、**事後変更禁止**、`[critical]` を必ず含める）。
3. **新規サブエージェント** にだけ指示を読ませ、**自分の読み直しで代用しない**。
4. `reference.md` の **Subagent invocation contract** に沿って実行させ、報告を取る。
5. 両面評価（不明点のフェーズ分類、`Issue / Cause / General Fix Rule`、成功は `[critical]` 全達成時のみ、など）。メトリクスは **定性を主**。
6. **1 イテレーション 1 テーマ**で対象プロンプトに最小差分を入れる。台帳と fix propagation を参照。
7. **新しい実行者**で繰り返す（学習汚染防止）。
8. `reference.md` の **収束条件**で止める（高重要度は連続クリア回数を厳しめに）。

### Cursor 特有の注意

- **Task tool** = Cursor のサブエージェント起動に相当する、と解釈する。
- `tool_uses` / `duration_ms` が **返ってこない** 場合は表に `—` と書き、**推測で数値を埋めない**（`SKILL.md` の「Cursor measurement」）。
- サブ起動が **不可能** なら、別チャットに依頼するか、`empirical evaluation skipped: dispatch unavailable` とユーザーに明示する。**自己読み直しの代替は禁止**。

## Kansu リポジトリとの関係

- コーディング規約の **全文は Skill に書かない**。正本は [`.cursor/rules/global.mdc`](../../rules/global.mdc) と [`.cursor/rules/kansu-agent-conventions.mdc`](../../rules/kansu-agent-conventions.mdc)。
- **ユーザー向け説明・コミット・PR 説明は日本語**（`kansu-agent-conventions`）。英語の `SKILL.md` は「エージェント向け手順」であり、人間向けの必須読物ではない。

## 調査メモとの関係

[mizchi/skills](https://github.com/mizchi/skills) 全体の採用候補は [mizchi-skills 調査メモ](../../../docs/agent-skills/mizchi-skills-survey.md) を参照。

## upstream の取り込み

`upstream-divergences.md` 冒頭の手順で raw とコミット SHA を更新し、差分が出たら `SKILL.md` / `reference.md` を英語側で追随し、**日本語の本ファイル（`OVERVIEW-ja.md`）** に運用上の追記が必要かだけ判断する。
