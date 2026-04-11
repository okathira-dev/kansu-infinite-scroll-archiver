# Kansu: infinite scroll archiver 実装計画

## 1. 基本方針

- 要件定義書の要件ID（`FR-*` / `NFR-*`）を基準に、実装・テスト・ドキュメントを追跡可能にする
- Manifest V3の制約（Service Workerの停止/再開）を前提に、イベント駆動・永続化中心で設計する
- 「小さく作って通す」を優先し、フェーズごとにCI通過可能な状態を維持する

## 2. 完了定義（共通DoD）

各フェーズの完了条件は次を満たすこと。

- 該当機能のユニットテストが追加/更新され、`pnpm test` で通過
- 必要なE2Eが追加/更新され、`pnpm e2e` で通過
- `pnpm check` と `pnpm lint-md` が通過
- 関連ドキュメント（`requirements` / `implementation_plan` / `implementation_guide`）が同期されている

## 3. フェーズ計画

### 3.1. Phase 0: 基盤整備

- **対象要件**: `NFR-31`
- **範囲**:
  - WXT + React + TypeScript のプロジェクト土台
  - Biome / MarkdownLint / Vitest / Playwright / Husky / CI
  - Dexie / Zustand の導入
- **備考**:
  - E2E 拡充に合わせた拡張 fixture の安定化は、運用・品質面で継続的に見直す

### 3.2. Phase 1: ドメインモデルとメッセージ契約

- **対象要件**: `FR-01` `FR-02` `FR-03` `NFR-10` `NFR-11`
- **実装項目**:
  - 型定義（サービス設定、抽出レコード、検索条件、インポート形式）
  - メッセージ種別（request/response）のdiscriminated union化
  - エラーレスポンス形式の統一（`code`, `message`, `details`）
- **テスト**:
  - 型ガード/バリデーションのユニットテスト
  - メッセージハンドラの正常系/異常系テスト
- **成果物**:
  - `src/lib/types/*`
  - `src/lib/messages/*`
  - `implementation_guide` の契約セクション更新

### 3.3. Phase 2: ストレージ層（Dexie）

- **対象要件**: `FR-20` `FR-42` `NFR-04` `NFR-12`
- **補足**: 検索・ソート・ページネーション API は `FR-21`〜`FR-23` のうちストレージ／クエリ側の充足に寄与する。受け入れに必要な UI は Phase 4 で扱う。
- **実装項目**:
  - Dexieスキーマ定義（固定テーブル構成）
  - 保存API（upsert / bulkPut / transaction）
  - 検索API（条件フィルタ、ページネーション、ソート）
  - インポート時のトランザクション制御
- **テスト**:
  - レコード重複時のupsertテスト
  - `bulkPut` 部分失敗時の挙動テスト
  - ページネーション境界値テスト
- **成果物**:
  - `src/lib/db/*`
  - `src/lib/repositories/*`

### 3.4. Phase 3: 抽出エンジン（Content Script）

- **対象要件**: `FR-10` `FR-11` `FR-12` `FR-13` `NFR-03`
- **実装項目**:
  - URL一致時のみ抽出を有効化
  - `MutationObserver` + バッチ処理（debounce/queue）
  - フィールド抽出器（text/link/image/regex）
  - 主キー生成と保存要求メッセージ送信
- **テスト**:
  - DOM差分を模擬した抽出ロジックテスト
  - 大量mutationでの過剰実行防止テスト
  - 抽出失敗時の安全なスキップテスト
- **成果物**:
  - `src/entrypoints/content/*`（必要に応じて分割）
  - 抽出ルールのサンプルfixture

### 3.5. Phase 4: UI（Popup / Options / メインUI）

- **対象要件**: `FR-21` `FR-22` `FR-23` `FR-30` `FR-31` `FR-32` `FR-33`
- **実装項目**:
  - Popup: UI表示トグル、Options遷移
  - Options: サービス設定CRUD、入力バリデーション（`appSettings` を用いたグローバル設定の UI・読み書きは後続フェーズ。IndexedDB スキーマ側の拡張余地は先行して確保する）
  - メインUI: 検索、検索対象フィールド選択（`targetFieldNames`）、ソート、ページネーション、トースト通知
  - 正規化検索（`NFKC` + `wanakana` によるかな統一。辞書による漢字読み推定は対象外）と日本語ソート（`Intl.Collator`）
- **テスト**:
  - コンポーネントテスト（フォーム/一覧/通知）
  - E2E（Popup→UI操作→結果反映）
- **成果物**:
  - `src/entrypoints/popup/*`
  - `src/entrypoints/options/*`
  - `src/components/*`

### 3.6. Phase 5: インポート/エクスポート

- **対象要件**: `FR-40` `FR-41` `FR-42` `NFR-23`
- **実装項目**:
  - JSONフォーマット実装（`schemaVersion` 付き）
  - 入力スキーマ検証
  - サービス単位エクスポート/インポート処理
- **テスト**:
  - 正常系（round-trip）テスト
  - 不正JSON・不正schemaVersionの異常系テスト
- **成果物**:
  - `src/lib/import-export/*`
  - ユーザー向けエラーメッセージ定義

### 3.7. Phase 6: 品質強化とリリース準備

- **対象要件**: `NFR-01` `NFR-02` `NFR-20` `NFR-21` `NFR-22` `NFR-30` `NFR-31`
- **実装項目**:
  - パフォーマンス計測（検索応答、抽出処理時間）
  - 権限見直し（最小権限）。Content Script の `matches` / `host_permissions` と `NFR-21` の整合を取る
  - Web Store公開に向けた説明文・プライバシー整備
  - `FR-33`（キーボード操作）の利用者向け明示（ヘルプ文言・必要なら E2E）
  - メイン UI 表示中に Options で設定を変更したときの再取得・伝播方式の確定（`runtime` メッセージ、再実行、再読み込み等）
  - （任意）Popup の成功・失敗フィードバックをトーストに揃えるかは要件解釈の確認のうえで検討
  - （任意）表記ゆれを含む検索の E2E 拡充、`MainPanel` のデバウンス込み結合テスト
  - （任意）インポート JSON のスキーマを Zod / Valibot 等へ移行するか評価し、採用時は `schemaVersion` ごとにスキーマを分離する（詳細は「4.2. 将来拡張（インポート JSON のランタイム検証）」）
- **テスト**:
  - 回帰E2E
  - 大量データシナリオの手動検証手順を確立
- **成果物**:
  - リリースチェックリスト
  - Web Store提出用メタ情報草案

## 4. テスト戦略（横断）

- **ユニットテスト（Vitest）**: 純粋関数、バリデーション、DBロジック、検索ロジック
- **コンポーネントテスト（Vitest + RTL）**: フォーム、一覧、状態遷移、通知
- **E2E（Playwright）**:
  - 拡張読み込みはpersistent contextで行う
  - MV3 Service Worker取得・再起動を考慮したfixtureを使う
  - Popup/Options/Content Scriptの主要導線をシナリオ化する

### 4.1. 将来拡張（E2E 対応ブラウザ）

- 現行の拡張 E2E は Chromium 実行を前提に設計する。
- Firefox / WebKit の E2E は、ブラウザ別の拡張ロード手順・成果物・fixture 起動方式を分離したうえで、別トラックとして段階的に追加する。

### 4.2. 将来拡張（インポート JSON のランタイム検証）

- インポート JSON は `JSON.parse` 結果を `unknown` 扱いにし、検証成功後のみドメイン型へ絞り込む方針を維持する（信頼できない入力への型アサーションは避ける）。
- `schemaVersion` の分岐やネストが複雑化した場合、**Zod** や **Valibot** 等のスキーマライブラリ導入を検討する。
  - 判断材料: 手書き検証の漏れ・重複、レビュー負荷、バンドルサイズ（`wxt build` 後の chunk を比較する）。
  - 拡張機能ではバンドルが効きやすいため、**ツリーシェイクしやすい API**（例: Valibot の関数分割スタイル）を候補に含める。
- 導入する場合も、既存の `VALIDATION_ERROR` / `ValidationIssue` 形式へのマッピングを維持し、メッセージ契約を壊さないこと。

## 5. リスクと緩和策

- **MV3ライフサイクル起因の不安定化**
  - 緩和: 揮発状態依存を避け、再実行可能なハンドラに統一
- **対象サイトDOM変更で抽出失敗**
  - 緩和: サービス設定バリデーションと失敗時通知、ルール更新導線を整備
- **大量データ時の検索遅延**
  - 緩和: 正規化フィールド事前計算、インデックス最適化、ページング必須化
- **Content Script の Radix Select とホストページのレイアウト**
  - メニュー表示時に Radix がフォーカス管理用としてホストの `document.body` に `data-radix-focus-guard` を挿入する。サイトの CSS／レイアウト次第では見かけ上の空間が生じ、開閉のたびにページがガクつくことがある。`SelectContent` の Portal 先を Shadow 内にしても、この挙動はホスト `body` 側に残る。
  - 緩和の検討軸: ガード要素向けのホスト CSS（効き方はサイト依存）、公式 API・挙動の利用可否、ネイティブ `<select>` への切替、パッチ／フォーク。実装の追跡は content メイン UI ソース内の TODO コメントを起点にする。
