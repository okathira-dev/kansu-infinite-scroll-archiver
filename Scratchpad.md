# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています）

## 現在のタスク

`docs/implementation_plan.md` の Phase 1 に入る前に、依存関係を `docs/dependency_upgrade_table.md` の方針で最新化する。

## TODO（実装前）

- [ ] `docs/dependency_upgrade_table.md` の推奨バッチに従い依存を更新する（Vite 連動・メジャーアップは同文書の注意に従い、無理に一括にしない）
- [ ] `pnpm install` 後、`pnpm check` / `pnpm compile` / `pnpm test` / `pnpm build` / `pnpm e2e` を通す
- [ ] Playwright を上げた場合は `pnpm exec playwright install`、Biome を上げた場合は `biome.json` の `$schema` 等を追随させる

## 進捗状況

- [x] `docs/requirements.md` / `docs/implementation_plan.md` / `docs/implementation_guide.md` の現状レビュー
- [x] Chrome Extension MV3 / MutationObserver / Playwright / 文字列正規化の最新ベストプラクティス調査
- [x] `docs/requirements.md` の詳細化（機能仕様・非機能指標・受け入れ基準）
- [x] `docs/implementation_plan.md` のフェーズ・テスト戦略更新
- [x] `docs/implementation_guide.md` の設計詳細更新（データモデル・メッセージ契約・性能設計）
- [x] 3ドキュメント間の整合性チェック
- [x] 旧 `implementation_guide` の 2.2 と現行版の差分確認
- [x] 現行 `implementation_guide` へ不足記述の追記（配置/責務詳細/共有モジュール/データフロー/開発運用）
- [x] 追記後の lint と最終レビュー

## 過去タスク（完了）

- [X] WXTプロジェクトの作成と動作確認
- [X] Gitの初期化と初回コミット
- [X] コード品質ツールの導入 (Biome)
- [X] UIコンポーネント基盤の導入 (Shadcn/ui)
- [X] ドキュメント規約ツールの導入 (MarkdownLint)
- [X] テストフレームワークのセットアップ (Vitest)
- [X] E2Eテストフレームワークの導入 (Playwright)
- [X] アプリケーションライブラリの導入 (Dexie, Zustand)
- [X] 実装ガイドの視覚化 (Mermaid図追加)
- [X] GitHub WorkflowとHuskyのセットアップ

## メモと反省

- WXTの導入と動作確認が完了した。
- `src` ディレクトリ構造を採用した。
- Gitの初期化と初回コミットが完了した。
- Biomeを導入し、コード品質管理の基盤を構築した。
- Shadcn/uiのセットアップを公式サンプルを参考に実施し、動作確認済み。
- アイコンライブラリを`Radix UI Icons`から`Lucide React`に変更した。
- `markdownlint-cli2` を使用してMarkdownLintのセットアップを完了した。
- Vitestのセットアップを完了した。
- 開発方針を検討し、UIコンポーネントの分離開発（Storybook）よりも、拡張機能全体の動作を保証するE2Eテスト（Playwright）を優先することにした。
- Playwrightのセットアップを完了した。
- 状態管理ライブラリを、動的フォームの扱いに長けたZustandに統一することを決定した。
- DexieとZustandのインストールが完了し、セットアップフェーズがすべて完了した。
- 実装ガイドに5つのmermaid図（システムアーキテクチャ図、データフロー図、技術スタック構成図、データ構造図、コンポーネント相互作用図）を追加し、視覚的に理解しやすくした。
- 技術スタック構成図を修正し、TypeScriptを開発環境に移動、開発品質と開発環境の独立性を強化した。
- コンポーネント相互作用図を削除し、実態と異なる混乱を招く可能性のある図を除去した。最終的に4つの図（システムアーキテクチャ図、データフロー図、技術スタック構成図、データ構造図）でシステムを表現することにした。
- GitHub Workflow（CI）を設定し、check、build、test、E2Eテストを自動実行するようにした。
- Huskyを導入し、コミット時にlint-stagedを実行してコード品質を保つようにした。
- CIエラーを修正：pnpmのセットアップ順序を修正し、PlaywrightをCI環境でheadlessモードで実行するように設定した。
- VitestとPlaywrightの分離設定を完了：vitest.config.tsでE2Eディレクトリを除外し、ユニットテストとE2Eテストを適切に分離した。
- CIワークフローとPlaywrightワークフローの連携設定を完了：CIでビルドした成果物をPlaywrightで再利用するように設定した。
- 同一ワークフロー内でE2Eテストを実行するように変更：CIジョブの後にE2Eジョブを実行し、ビルド成果物を効率的に再利用できるようにした。
- 隠しファイルの問題を解決：.outputディレクトリが隠しディレクトリ扱いのため、include-hidden-files: trueを追加してアーティファクトが正しく処理されるようにした。
- Serena MCP: プロジェクト `kansu-infinite-scroll-archiver` をアクティブ化しオンボーディング完了。メモリ `project/overview`, `suggested_commands`, `code_style_and_conventions`, `task_completion` を作成。
- その後、Serena オンボーディングを再実行し、`package.json` / `biome.json` / `src/` 構成を再確認。上記4メモリを最新版に書き換え（依存バージョン、`src/lib`・`components/ui`、Playwright 初回 `install` 注記など）。
- MarkdownLint（markdownlint-cli2）の除外は `.markdownlint-cli2.jsonc` の `ignores` のみ。`.cursor/**` と `.serena/**` を対象外とし、`Scratchpad.md` や `docs/` は `pnpm lint-md` / lint-staged のチェック対象。
- さらに、`GEMINI.md` を削除。Serena メモリ `ai_agent_operational_lessons` を廃止し、運用メモは `code_style_and_conventions.md` に統合（Cursor ルールと Serena の役割差も同ファイルに記載）。
- `docs/requirements.md` / `docs/implementation_plan.md` / `docs/implementation_guide.md` を再編し、`FR/NFR` ベースのトレーサビリティ、MV3ライフサイクル前提、`MutationObserver` バッチ化、`bulkPut + transaction`、`NFKC + かな差吸収` を明文化した。
- 次アクション: 実装前に依存関係を最新化（`docs/dependency_upgrade_table.md`）→ 続けて Phase 1（ドメインモデルとメッセージ契約）を最小実装し、テストと要件ID対応を先に固める。
- 旧 `implementation_guide` の 2.2/2.3/2.4 で重要だった記述の欠落を再点検し、現行版へ追記した（`src` 配置とWXTファイルベース構成、各エントリポイント責務の詳細、共有モジュール、データフロー、開発運用ポリシー）。
