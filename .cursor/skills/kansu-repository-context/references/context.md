# Kansu Repository Context — 詳細正本

`kansu-repository-context` の `SKILL.md` は要約のみとし、**ディレクトリ列挙と補足は本ファイルを正本**とする。  
配置・命名・検証フローなどの規約は `.cursor/rules/*.mdc` を正本とし、本ファイルでは構造一覧に限定する。

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

## 外部 Skill の入手元

- 典拠: [mizchi/skills](https://github.com/mizchi/skills)
- 本リポジトリに取り込み済みの例: `empirical-prompt-tuning`, `playwright-test`（追加時は本節を更新する）
