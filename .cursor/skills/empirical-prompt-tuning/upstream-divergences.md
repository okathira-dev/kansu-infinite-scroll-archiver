# upstream との差分（正本）

[mizchi/skills の `empirical-prompt-tuning/SKILL.md`](https://github.com/mizchi/skills/blob/main/empirical-prompt-tuning/SKILL.md) との**意図的な差分**と、本リポジトリ（Cursor）での扱いの正本。コピー用の長文は [`references/original.md`](references/original.md)。

## upstream の固定参照

| 項目 | 値 |
| --- | --- |
| リポジトリ | `mizchi/skills` |
| パス | `empirical-prompt-tuning/SKILL.md` |
| raw | `https://raw.githubusercontent.com/mizchi/skills/main/empirical-prompt-tuning/SKILL.md` |
| 同期時点の `main` 先端コミット SHA | `a0ebf680f62836f64d7e9b741ee212f55b108f88` |

**再同期**: raw を再取得し、`main` の `sha` を上表に反映する。[`SKILL.md`](SKILL.md) / [`references/original.md`](references/original.md) / 本ファイルを追随したら、下記「現在の意図的差分」がまだ正しいか確認し、変わった点だけ更新する。

---

## 用語・ツールのマッピング

| upstream の表現 | 本リポジトリ（Cursor）での扱い | 理由 |
| --- | --- | --- |
| Task tool | Cursor の **Task**（サブエージェント起動）に相当。「新規サブセッションで実行」と解釈する。 | Cursor の用語に合わせる。 |
| `tool_uses` / usage meta（Task 戻り値） | **付与される場合**はその数値を用いる。**付与されない場合**は表を `—` とし脚注で明示。推定値で埋めない。 | 取得可否は環境依存。 |
| `duration_ms` | 上に同じ。 | 同上 |
| Alternative 1: Claude Code session | **別の Cursor チャット／エージェント実行**へ評価を依頼する。 | 開発環境が Cursor 前提。 |
| 本文言語 | [`SKILL.md`](SKILL.md) / [`references/original.md`](references/original.md) は **英語**（外部に英語版があるため）。プロジェクトのルール・ユーザー向け説明は **`.cursor/rules/*.mdc` と `docs/`** が正本。フロントマターの `description` は英語（Cursor Skill 推奨）。 | トークン最適化と、日本語正本の二重化を避ける。 |
| Related: `superpowers:*` 等 | **任意参照** とし、手順の前提にしない。 | ワークスペースに同梱されない。 |

---

## 現在の意図的差分（一覧）

| 観点 | 本リポジトリの方針 |
| --- | --- |
| ファイル役割 | [`SKILL.md`](SKILL.md) = ワークフロー・最小読みパス・Cursor 計測など。[`references/original.md`](references/original.md) = 長文テンプレ・表（upstream に近いブロック）。 |
| Task / usage メタ | `tool_uses` / `duration_ms` が **無い場合**は `—`、推定禁止（`SKILL.md` の「Cursor measurement」と `references/original.md` の評価軸に明記）。 |
| 環境の言い換え | 「Claude Code session」等 → **Cursor** の別チャット／別エージェント実行。 |
| Kansu との整合 | `SKILL.md` にプロジェクトの `.mdc` を列挙しない。言語・ルール参照・`.cursor` 編集方針は [kansu-agent-instructions.mdc](mdc:.cursor/rules/kansu-agent-instructions.mdc) と [kansu-agent-conventions.mdc](mdc:.cursor/rules/kansu-agent-conventions.mdc)、運用は [global.mdc](mdc:.cursor/rules/global.mdc) に集約（旧「Repository context (Kansu)」節は撤去）。 |
| Related 節 | `retrospective-codify` の GitHub リンクに限定し、必須依存にしない。 |
| `references/original.md` の構成 | **Subagent invocation contract を先頭**。続けて評価軸・提示フォーマット・Fix propagation patterns 等（コピー用途を優先）。 |
| 補助ドキュメント | `OVERVIEW-ja.md` は置かない。差分の説明は本ファイルに集約。 |
| 最小読み取り | SKILL.md に **Minimal reading path**（構造レビュー時とフル反復で読む範囲を分離）。 |
| frontmatter `description` | 「新規 subagent による実証評価が必要な場面」に寄せ、軽微な文言調整は対象外と明示。 |

---

## 次回 upstream を取り込むとき

1. raw を取得し `empirical-prompt-tuning/SKILL.md` と diff を取る。
2. 本ファイルの「固定参照」の SHA を更新する。
3. [`SKILL.md`](SKILL.md) / [`references/original.md`](references/original.md) を **英語**で追随する。
4. 「用語・ツールのマッピング」と「現在の意図的差分」を、変わった点だけ更新する。
