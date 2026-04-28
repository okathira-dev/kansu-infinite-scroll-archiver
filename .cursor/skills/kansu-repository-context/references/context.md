# Kansu Repository Context Reference

## プロジェクト構造

- `src/entrypoints/`: WXT エントリ（background / content / popup / options）
- `src/components/ui/`: 共有 UI 基盤（UI プリミティブ）
- `src/components/`: `ui/` 以外は境界モジュール（外部 API ラッパー等）として扱う
- `src/lib/`: 共有ロジック・ユーティリティ
- `docs/`: 要件・実装計画・実装ガイド・ストレージ設計・ユビキタス言語
- `store/`: Chrome Web Store 掲載用素材
- `src/**/*.test.ts`: ユニットテスト（Vitest）
- `e2e/`: E2E テスト（Playwright）

## サポートファイル

- `Scratchpad.md`: 短期タスク計画・進捗管理
- `.serena/memories/*.md`: 長期知識
- `.cursor/GITHUB-MCP.md`: GitHub MCP 利用手順

## 外部 Skill の入手元と候補

- 入手元: [mizchi/skills](https://github.com/mizchi/skills)
- 導入済み: `empirical-prompt-tuning`, `playwright-test`
