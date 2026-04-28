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
- 主要ディレクトリ:
  - `src/entrypoints/`: WXT エントリ（background / content / popup / options）
  - `src/components/ui/`: 共有 UI 基盤
  - `src/lib/`: 共有ロジック
  - `docs/`: 要件・設計・ガイド
  - `e2e/`: Playwright E2E

## Skill / docs operations

- プロジェクトルールは `.cursor/rules/` に配置され、適用は各 frontmatter（`alwaysApply` / `globs` / `description`）で決まる。
- Skill は `.cursor/skills/*/` に配置し、外部由来 Skill は `SKILL.md` / `references/original.md` / `upstream-divergences.md` の三層で管理する。

## References

- 主要ドキュメント: `README.md`, `docs/requirements.md`, `docs/implementation_plan.md`, `docs/implementation_guide.md`
- 補足: `references/context.md`
