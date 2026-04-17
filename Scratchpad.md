# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています）

## 現在のタスク

Phase 6 の品質強化は一通り反映済み。Chrome Web Store 向けの**手順・チェックリスト・メタ草案**は [docs/chrome-web-store-release.md](docs/chrome-web-store-release.md) に集約し、**ここで一区切り**。

**次（別PR）**: `package.json` の version を **0.1.0** に上げ、手順書どおり **手動でストア提出**（ビルド・ZIP・アップロード）を試す。そのPRで **リスティング情報を詰める**（説明・スクリーンショット・Privacy 宣言・サポート連絡先など）。

併行してよいもの：**UI 確認・修正**（Popup / Options / メインUI の見た目・操作性・a11y）。必要なら上記リリースPRとは分けてもよい。

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
- [x] `src/lib/types` の追加（`ServiceConfig` / `FieldRule` / `ExtractedRecord` / `SearchQuery` / import-export 型）
- [x] `src/lib/types/validation.ts` で設定保存と message payload のランタイム検証を実装
- [x] `src/lib/messages` の追加（request/response 契約、統一エラー形式、message parser）
- [x] `src/entrypoints/background.ts` を契約準拠のメッセージルータに置換
- [x] `src/lib/types/*.test.ts` と `src/lib/messages/*.test.ts` に正常系/異常系テストを追加
- [x] `src/lib/db/kansuDb.ts` に Dexie スキーマ（`serviceConfigs` / `records` / `appSettings`）を実装
- [x] `src/lib/repositories` を追加し、設定保存・レコード upsert/search/import の永続化APIを実装
- [x] `src/lib/messages/router.ts` を Map 実装から Repository 実装へ置換し、契約を維持
- [x] `src/entrypoints/background.ts` で DB / Repository を初期化し MessageRouter に注入
- [x] `src/lib/repositories/recordRepository.test.ts` を追加し、重複 upsert / transaction ロールバック / ページ境界を検証
- [x] `fake-indexeddb` を導入し、Dexie テストランタイムを整備
- [x] `pnpm check` / `pnpm test` を通過
- [x] `src/entrypoints/content/` を追加し、Content Script をエンジン本体とユーティリティへ分割
- [x] URL パターン一致判定、フィールド抽出器（text/link/image/regex）、検索用正規化（NFKC + `wanakana.toHiragana` によるかな統一）を実装
- [x] `MutationObserver` 通知のバッチ実行（delay queue）と `pagehide` cleanup を実装
- [x] `records/bulkUpsert` 送信と失敗時継続のエラーハンドリングを実装
- [x] Phase 3 向けのテスト/fixture を追加（DOM差分模擬、大量 mutation 集約、安全スキップ）
- [x] 追加実装後に `pnpm check` / `pnpm test` を再通過
- [x] `ExtractedRecord` を `fieldValues`（`raw` / `normalized`）へ置換し、`normalizedSearchText` と `data` を削除
- [x] `ServiceConfig.fields` / `SearchQuery.fields` を `fieldRules` / `targetFieldNames` にリネーム
- [x] `RecordRepository.search` を対象フィールド限定の正規化検索へ修正（キーワードも同一正規化）
- [x] 型・バリデーション・メッセージ経路・テスト・`implementation_guide.md` を新設計に同期
- [x] `wanakana` を導入し、`normalizeForSearch` のかな統一処理をライブラリ化（`passRomaji: true`, `convertLongVowelMark: false` を固定）
- [x] `src/lib/search/textNormalization.test.ts` を新設し、NFKC・かな統一・英字混在・長音記号の正規化結果を期待値で固定
- [x] `debug-fixtures/infinite-scroll.html` を日本語/英語/日英混在のタイトルローテーションへ更新
- [x] `requirements.md` / `implementation_guide.md` / `wxt-dev-debug.md` に正規化範囲（自動読み一致なし）と fixture 方針を反映
- [x] `configs/delete` メッセージ契約・バリデーション・Router・Repository を追加し、設定削除と関連レコード削除フローを実装
- [x] Phase 4 の UI を実装（Popup トグル / Options CRUD / Content Script Shadow DOM メインUI）
- [x] Zustand ストアを追加（`serviceConfigStore` / `searchStore`）し、UI からの検索・保存・削除を集約
- [x] E2E を新UI仕様へ更新（`popup.spec.ts` / `optionsCrud.spec.ts` / `mainUiSearch.spec.ts`）し、既存抽出 E2E と併せて通過
- [x] `@testing-library/*` + `jsdom` を導入し、フォーム/検索/ページネーションのコンポーネントテストを追加
- [x] `pnpm check` / `pnpm test` / `pnpm e2e` を再通過
- [x] Phase 4 レビュー由来のフォローアップ（実装・`docs/implementation_guide.md` / `docs/implementation_plan.md` への方針記載）
- [x] Storybook の複合 UI ストーリーを「通常構成 + Controls は当該サブ（または専用 props）」へ統一（`card` / `dialog` / `pagination` / `select` / `table` / `tabs`）
- [x] `SelectContent` に `scrollUpButtonProps` / `scrollDownButtonProps` を追加し、`SelectScrollUpButton` / `SelectScrollDownButton` ストーリーを実利用構成で Controls 対象化
- [x] `DialogTrigger` / `DialogTitle` ストーリーで `DialogTitle` / `DialogDescription` の文脈を補完し、ダイアログ a11y 前提を明示
- [x] `TableBody` / `TableFooter` / `TableRow` ストーリーをヘッダ付きの通常テーブル構成へ調整
- [x] Stories の Controls 同期で使っていた `useEffect` を `useArgs` へ置換（`Select` / `SelectItem` / `PaginationControls` / `SearchBar` / `RecordTable`）
- [x] Storybook 構成変更後に `pnpm run compile` / `pnpm test:storybook` を再通過
- [x] `src/lib/import-export` を追加（`SUPPORTED_SCHEMA_VERSION`、JSON parse/stringify、ファイル保存、エラーマッピング）
- [x] `validateImportPayload` を strict schemaVersion 判定へ更新し、`MessageRouter` で `UNSUPPORTED_SCHEMA_VERSION` を返却
- [x] Options（`serviceConfigStore` / `App`）にサービス単位 JSON エクスポート・インポート導線を実装
- [x] `validation` / `router` / `options` / E2E テストを Phase 5 要件（round-trip・不正 schemaVersion・JSON I/O）へ拡充
- [x] `pnpm check` / `pnpm test` / `pnpm e2e` を通過（E2E 初回の Popup テストタイムアウトは再実行で解消）
- [x] Phase 6: fixture を `text` / `linkUrl` / `imageUrl` / `regex` の 4 パターンで統一（`debug-fixtures/infinite-scroll.html`、`fixtureServiceConfig`、E2E 設定）
- [x] Phase 6: `validation.test` / `recordExtractor.test` に regex・URL 欠損などの境界ケースを追加
- [x] Phase 6: 設定更新時に Background から Content Script へ通知し、Main UI が再取得する伝播経路を実装
- [x] Phase 6: 開発時計測を追加（検索応答、抽出〜保存）。`globalThis.__KANSU_DEV_PERF_METRICS__` に蓄積して p95 を確認可能化
- [x] Phase 6: `FR-33` のキーボード操作（Alt + ← / →）を E2E で明示検証
- [x] Phase 6: 権限最小化レビューを実施し、現時点は `host_permissions` を追加せず `matches: ["<all_urls>"]` 維持（互換性優先）
- [x] Phase 6: `docs/wxt-dev-debug.md` を fixture 4 パターンと性能計測手順に同期
- [x] Phase 6 任意項目の採否を整理（Popup トースト統一・import スキーマ移行は保留、検索E2E/debounce回帰は継続強化）
- [x] `docs/chrome-web-store-release.md` 追加（CWS 提出手順・チェックリスト・メタ草案・プライバシーたたき台・公式リンク）。Scratchpad から参照
- [x] Issue #22: サービス単位通知設定（バッジ/トースト詳細）を追加し、監視中 `ON` と保存合計件数バッジ、保存詳細トースト（`+N件`/推定サイズ）を実装。対応テストを追加し `pnpm check` / `pnpm test` を通過

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
- `docs/implementation_plan.md` と `docs/implementation_guide.md` は要件・設計の普遍的記述に留め、実装の進み具合や「いまどこまで終わったか」は本 Scratchpad とコードで追う（計画書に実装状況を書かない方針）。
- Phase 2 として、Dexie スキーマ・Repository 層・MessageRouter 差し替え・Background 注入・関連テスト追加を完了した。
- Phase 3 として、Content Script の抽出エンジン（URL一致、抽出器、MutationObserverバッチ、bulkUpsert送信、ユニットテスト）を実装し、`ExtractedRecord.fieldValues`（`raw` / `normalized`）・`fieldRules` / `targetFieldNames`・`wanakana` 正規化まで完了した。
- Phase 6 の品質強化を先行実施し、リリース準備は後続トラックに分離していた。ストア提出の手順・草案は `docs/chrome-web-store-release.md` まで完了。**次は別PRで 0.1.0 の手動リリース**し、そのPRでリスティングを詰める（上記「現在のタスク」参照）。UI 最終調整は併行可。
- 旧 `implementation_guide` の 2.2/2.3/2.4 で重要だった記述の欠落を再点検し、現行版へ追記した（`src` 配置とWXTファイルベース構成、各エントリポイント責務の詳細、共有モジュール、データフロー、開発運用ポリシー）。
- 依存関係を最新化済み。更新手順は [README.md](README.md) の「依存関係の更新」を参照。
