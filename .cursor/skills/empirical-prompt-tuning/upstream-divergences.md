# upstream との差分（正本）

[mizchi/skills の `empirical-prompt-tuning/SKILL.md`](https://github.com/mizchi/skills/blob/main/empirical-prompt-tuning/SKILL.md) との**意図的な差分**と、本リポジトリ（Cursor）での扱いの正本。コピー用の長文は [`references/original.md`](references/original.md)。

## upstream の固定参照

| 項目 | 値 |
| --- | --- |
| リポジトリ | `mizchi/skills` |
| パス | `empirical-prompt-tuning/SKILL.md` |
| raw | `https://raw.githubusercontent.com/mizchi/skills/main/empirical-prompt-tuning/SKILL.md` |
| 同期時点の `main` 先端コミット SHA | `a0ebf680f62836f64d7e9b741ee212f55b108f88` |

**再同期**: raw を再取得し API で `main` の `sha` を更新する。`SKILL.md` / `references/original.md` / 本ファイルを変えたら、本節の SHA を更新し、差分は **E-xx** で追記する。

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

## 本リポジトリでの差分（理由）

### E-01: ファイル分割

- **差分**: 核ワークフローを [`SKILL.md`](SKILL.md)、長文テンプレ・表を [`references/original.md`](references/original.md)（upstream に近いブロック）。
- **理由**: Skill のオンデマンド読込と、コピー用途のテンプレを先に置くため。

### E-02: Workflow と usage メタ

- **差分**: Task 戻り値の `tool_uses` / `duration_ms` が **無い場合**の扱い（`—`、推定禁止）を `SKILL.md` の「Cursor measurement」と `references/original.md` の評価軸に明記。
- **理由**: Cursor 実装でメタが常に付与されるとは限らない。

### E-03: Environment constraints の製品名

- **差分**: 「Claude Code session」等を **Cursor** の別チャット／別エージェント実行に言い換え。
- **理由**: このリポジトリの前提環境に合わせる。

### E-04: リポジトリ正本への参照

- **差分**: [`SKILL.md`](SKILL.md) に [`.cursor/rules/global.mdc`](../../rules/global.mdc) と [`.cursor/rules/kansu-agent-conventions.mdc`](../../rules/kansu-agent-conventions.mdc) への参照を追加。規約本文は複製しない。
- **理由**: 二重正本を避ける。

### E-05: Related 節

- **差分**: `retrospective-codify` の GitHub リンクに限定し、必須依存にしない。
- **理由**: 外部パッケージを前提にしない。

### E-06: frontmatter `description`

- **差分**: 英語を維持し、**Cursor / subagent** に触れた短い補足を追加。
- **理由**: Skill の発見性。

### E-07: `references/original.md` の節順

- **差分**: **Subagent invocation contract を先頭**にし、評価軸・提示フォーマット等を続ける。
- **理由**: コピー用途のテンプレを先に置く。

### E-08: Fix propagation patterns の所在

- **差分**: [`references/original.md`](references/original.md) の **Fix propagation patterns** に収録。
- **理由**: E-01 の分割方針に合わせる。

### E-09: 補助ドキュメント

- **差分**: `OVERVIEW-ja.md` は **置かない**。差分と運用上の注意の正本は **本ファイル**。
- **理由**: `SKILL.md` / `references/original.md` / `upstream-divergences.md` の三層に統一し、説明の重複を避ける。

### E-10: 最小読み取り導線

- **差分**: [`SKILL.md`](SKILL.md) に **Minimal reading path** を追加し、構造レビュー時とフル反復時で読む範囲を分けた。
- **理由**: on-demand 読み込みで `references/original.md` 全読みに寄りがちな運用を避けるため。

### E-11: frontmatter `description` の適用境界

- **差分**: `description` を「新規 subagent による実証評価が必要な場面」に寄せ、軽微な文言調整を対象外として明示した。
- **理由**: Trigger の過剰発火を抑え、重い評価ループの誤適用を減らすため。

---

## 次回 upstream を取り込むとき

1. raw を取得し `empirical-prompt-tuning/SKILL.md` と diff を取る。
2. 本ファイルの「固定参照」の SHA を更新する。
3. [`SKILL.md`](SKILL.md) / [`references/original.md`](references/original.md) を **英語**で追随し、差分が増えたら本ファイルに **E-xx** を追加する。
4. 「用語・ツールのマッピング」を必要なら更新する。
