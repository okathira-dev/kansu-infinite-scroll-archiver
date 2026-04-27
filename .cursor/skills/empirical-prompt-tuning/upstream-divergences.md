# upstream との差分（正本）

このファイルは、[mizchi/skills の `empirical-prompt-tuning/SKILL.md`](https://github.com/mizchi/skills/blob/main/empirical-prompt-tuning/SKILL.md) をこのリポジトリ向けに導入・統合した際に、**原文から意図的に変えた点**を追跡する。コピー用テンプレの本文は `reference.md` に置き、差分の説明は本ファイルが正本。

## upstream の固定参照

| 項目 | 値 |
| --- | --- |
| リポジトリ | `mizchi/skills` |
| パス | `empirical-prompt-tuning/SKILL.md` |
| raw（ブランチ `main` の先端として取得した時点） | `https://raw.githubusercontent.com/mizchi/skills/main/empirical-prompt-tuning/SKILL.md` |
| 同期時点の `main` 先端コミット SHA（API `GET /repos/mizchi/skills/commits/main`） | `a0ebf680f62836f64d7e9b741ee212f55b108f88` |

**再同期の手順（日付に依存しない）**: 上記 raw を再取得し、同 API で `main` の `sha` を取り直す。`SKILL.md` / `reference.md` または本ファイルを更新したら、本節の SHA を更新し、下記「変更エントリ」に追記する。

---

## 用語・ツールのマッピング（横断）

| upstream の表現 | 本リポジトリ（Cursor）での扱い | 理由 |
| --- | --- | --- |
| Task tool | Cursor の **Task**（サブエージェント起動）に相当。UI 文言は製品版で変わり得るため、「新規サブセッションで実行」と解釈する。 | Cursor の用語に合わせる。 |
| `tool_uses` / usage meta（Task 戻り値） | **付与される場合**はその数値を用いる。**付与されない場合**は表を `—` とし脚注で明示。推定値で埋めない。 | 取得可否は環境依存のため。 |
| `duration_ms` | 上に同じ。 | 同上 |
| Alternative 1: Claude Code session | **別の Cursor チャット／エージェント実行**へ評価を依頼する。 | 開発環境が Cursor 前提のため。 |
| 本文言語 | **`SKILL.md` / `reference.md` は英語**（mizchi の `SKILL.md` 原文に準拠）。**人間向けの日本語説明**は同ディレクトリの [`OVERVIEW-ja.md`](OVERVIEW-ja.md)。フロントマターの `description` は英語（Cursor Skill 推奨）。 | 英語原文をエージェント正とし、ユーザー向けは Skill 直下にコロケーションする方針。 |
| Related: `superpowers:*` 等 | 本 Skill からは **任意参照** とし、手順の前提にしない。 | ワークスペースに同梱されないため。 |

---

## 変更エントリ（単位ごと）

### E-01: ドキュメント分割（構造）

- **upstream**: 単一 `SKILL.md` に Workflow・表・契約全文・Presentation・Red flags・Common failures・Related がすべて入る。
- **本リポジトリ**: 核ワークフローを `SKILL.md` に、長文テンプレ・表を [`reference.md`](reference.md) へ分割。人間向け日本語は [`OVERVIEW-ja.md`](OVERVIEW-ja.md)（Skill ディレクトリにコロケーション）。
- **理由**: Cursor の Skill ガイド（本編は簡潔）と、人間向け説明の Skill 同梱の両立。

### E-02: Workflow 2・4・6 と usage メタ

- **upstream**: Task 戻り値の `tool_uses` / `duration_ms` を前提に記述。
- **本リポジトリ**: メタが **無い場合** の扱い（`—`、推定禁止）を `SKILL.md` の「Cursor measurement」と `reference.md` の評価軸節に明記。
- **理由**: Cursor 実装でメタが常に付与されるとは限らないため。

### E-03: Environment constraints の製品名

- **upstream**: 「Claude Code session」等。
- **本リポジトリ**: **Cursor** の別チャット／別エージェント実行に言い換え。
- **理由**: このリポジトリの前提環境に合わせる。

### E-04: リポジトリ正本への参照

- **upstream**: リポジトリ固有ルールへの参照なし。
- **本リポジトリ**: `SKILL.md` に [`.cursor/rules/global.mdc`](../../rules/global.mdc) と [`.cursor/rules/kansu-agent-conventions.mdc`](../../rules/kansu-agent-conventions.mdc) を追記。規約本文は複製しない。
- **理由**: 二重正本を避ける。

### E-05: Related 節

- **upstream**: `superpowers:*` / `retrospective-codify` 等を列挙。
- **本リポジトリ**: `retrospective-codify` の GitHub リンクに限定し、必須依存にしない。
- **理由**: 外部パッケージを前提にしない。

### E-06: frontmatter `description`

- **upstream**: 英語の一行。
- **本リポジトリ**: 英語を維持し、**Cursor / subagent** に触れた短い補足を追加。
- **理由**: Skill 発見性のため。

### E-07: `reference.md` の節順

- **upstream**: 単一ファイル内では Evaluation axes の直後に tool_uses の解釈が来るなどの順序。
- **本リポジトリ**: **Subagent invocation contract を先頭**にし、評価軸・提示フォーマット等を続ける。
- **理由**: コピー用途のテンプレを先に置く。

### E-08: Fix propagation patterns の所在

- **upstream**: メイン `SKILL.md` 内の独立見出し。
- **本リポジトリ**: [`reference.md`](reference.md) の **Fix propagation patterns** に収録。
- **理由**: E-01 の分割方針。

### E-09: 言語ポリシー（英語原文＋日本語ドキュメント）

- **upstream**: `SKILL.md` 全文が英語。
- **本リポジトリ**: `SKILL.md` / `reference.md` を **英語（原文準拠）** にし、日本語の全体説明・運用注意を **`OVERVIEW-ja.md`**（Skill ディレクトリにコロケーション）に集約。`SKILL.md` 先頭にそのリンクを1行置く。
- **理由**: 「mizchi の英語版原文を使う」かつ「ユーザー向けは日本語で伝わりやすく」の両立。索引用の調査メモのみ `docs/agent-skills/` に残す。

### E-10: 人間向け日本語の置き場所（`docs/` → Skill 同梱）

- **以前**: `docs/agent-skills/empirical-prompt-tuning.md` に日本語ガイドを置いていた。
- **本リポジトリ**: 同内容を [`OVERVIEW-ja.md`](OVERVIEW-ja.md) に移し、`docs` 側のファイルは削除。`SKILL.md` / `reference.md` / 本ファイルのリンクを差し替え。
- **理由**: Skill 専用ドキュメントのコロケーション方針。

---

## 省略・未取り込み（意図的）

| upstream の内容 | 扱い | 理由 |
| --- | --- | --- |
| 単一ファイルの長大な英語本文 | `SKILL.md` で要約し詳細は `reference.md` | E-01 |
| 見出し語順 | `SKILL.md` で「Cursor measurement」「Repository context」を前寄せ | 環境制約を先に示すため |

---

## 次回 upstream を取り込むとき

1. raw を取得し diff を取る（対象は `empirical-prompt-tuning/SKILL.md`）。
2. 本ファイルの「固定参照」の SHA を更新する。
3. `SKILL.md` / `reference.md` を **英語側**で追随し、日本語の `OVERVIEW-ja.md` に運用上の追記が要るか判断する。
4. 本ファイルに **新しい変更エントリ（E-xx）** を追加する。
