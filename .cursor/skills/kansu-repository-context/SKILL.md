---
name: kansu-repository-context
description: Kansu リポジトリの構造、技術スタック、参照ドキュメント、Skill 運用の前提を提示する。リポジトリ全体の把握、オンボーディング、どこを編集すべきかの判断が必要なときに使う。
---

# Kansu Repository Context

## When to use

- リポジトリ全体像（構造、技術スタック）を短時間で把握したいとき
- 変更対象の配置先を判断したいとき
- 参照すべき主要ドキュメントや Skill 運用方針を確認したいとき

## Quick context

- プロダクト: 無限スクロール型サイトからデータを抽出・保存・検索するブラウザ拡張「Kansu」
- 主な技術: WXT / TypeScript / React / Tailwind CSS / Zustand / Dexie / Biome / Vitest / Playwright / pnpm
- **ディレクトリの列挙・補足パス**の正本は [`references/context.md`](references/context.md)。`SKILL.md` では重複列挙しない。

## Skill / docs operations

- プロジェクトルールは `.cursor/rules/` に配置され、適用は各 frontmatter（`alwaysApply` / `globs` / `description`）で決まる。
- Skill は `.cursor/skills/*/` に配置する。`.cursor/rules` / `.cursor/skills` の編集原則の正本は [`.cursor/rules/kansu-agent-instructions.mdc`](../../rules/kansu-agent-instructions.mdc)。

## References（この Skill の役割）

- **`SKILL.md`**: 用途・技術スタック・運用の入口のみ。
- **`references/context.md`**: ディレクトリ一覧・サポートファイル・外部 Skill 導入の**詳細正本**。
- **規約の参照順**: `.cursor` 配下の編集規約や製品ドキュメント運用は [`.cursor/rules/kansu-agent-instructions.mdc`](../../rules/kansu-agent-instructions.mdc) を起点に辿る。
