---
name: kansu-coding-guidelines
description: Kansu 実装時の基本コーディング規約（差分最小、責務尊重、型安全、テスト判断、UI プリミティブのフォーカス/アクティブ）を適用する。実装・リファクタ・レビューで規約確認が必要なときに使う。
---

# Kansu Coding Guidelines

## When to use

- 実装・修正・リファクタ時に基本規約を確認したいとき
- 変更差分の方針やテスト追加方針を揃えたいとき
- `src/components/ui` のフォーカス/アクティブ挙動を合わせたいとき

## Core rules

- 複雑な箇所のみコメントで補足し、冗長な説明コメントは避ける。
- 型安全を優先し、`any` は必要最小限に限定する。

## Directory responsibility

- `src/entrypoints/`: エントリポイント
- `src/lib/`: 共有ロジック、ユーティリティ、純粋関数優先
- `src/components/ui/`: 再利用前提の UI プリミティブ

## Import / export

- 原則 `named export` / `named import`
- フレームワーク都合などで必要な場合のみ `default export`

## Quality gates

- フォーマット・lint は `biome.json` と `.cursor/rules/biome.mdc` に従う。
- ロジック変更時は `src/**/*.test.ts` 更新を検討。
- ユーザーフロー影響時は `e2e/` 更新を検討。

## UI primitive focus / active

- キーボードフォーカス: `focus-visible:*` を優先し、クリック時のみの `focus` リングを避ける。
- ポインタ押下: コンポーネント種別ごとの `active:*` 方針を揃える。
- 新規プリミティブも同一方針をデフォルトにし、例外は理由を明示する。

## References

- 詳細規約は `references/guidelines.md`
