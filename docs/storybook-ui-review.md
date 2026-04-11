# Storybook / UI レビュー結果まとめ

本書は、Kansu の Storybook（`pnpm storybook`、既定ポート 6006）および関連実装に対するレビュー結果を集約したものです。参照基準は主に [requirements.md](./requirements.md) の `FR-30`〜`FR-33`、`FR-40`〜`FR-42` と、自動テスト（E2E / コンポーネントテスト）の担保範囲です。

## 1. レビュー範囲

### 1.1 Storybook の収集条件

- 設定: [.storybook/main.ts](../.storybook/main.ts) の `stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"]`
- 現状: `.mdx` による Story は **0 件**（`.stories.tsx` のみ）

### 1.2 Story 一覧（全 20 ファイル / 約 35 Story）

| カテゴリ | ファイル数 | おおよその Story 数 | title プレフィックス |
| --- | --- | --- | --- |
| 共有 UI | 14 | 24 | `UI/*` |
| Content | 4 | 7 | `Content/*` |
| Popup | 1 | 1 | `Popup/App` |
| Options | 1 | 2 | `Options/App` |
| **計** | **20** | **約 35** | — |

**UI:** Badge（2）、Button（4）、Card（1）、Dialog（1）、Input（3）、Label（1）、Pagination（1）、Select（1）、Separator（2）、Sonner（1）、Switch（3）、Table（1）、Tabs（1）、Textarea（3）

**Content:** MainPanel（1）、PaginationControls（3）、RecordTable（2）、SearchBar（1）

**Popup / Options:** 各 App（1 / 2）

---

## 2. 重大度別の指摘（要件・実装・Story 横断）

### 2.1 Critical

- **C1:** **FR-40〜42（JSON インポート/エクスポート）の UI 導線が Options に未実装**
  - メッセージ契約・バックエンドは存在するが、[options/App.tsx](../src/entrypoints/options/App.tsx) に I/O UI なし。
  - MVP の「エクスポートまで完結」と AC-05 と未整合。

### 2.2 High

- **H1:** **FR-33「キーボードで検索・ソート・ページ移動」**のうち、**ページ移動（Alt + ← / →）のみ**明示
  - 参照: [MainPanel.tsx](../src/entrypoints/content/ui/MainPanel.tsx)。検索フォーカス・ソート列へのキーボード専用ショートカットは未整備。
- **H2:** **Storybook 用モック検索**がキーワード・対象フィールドを反映しない
  - 参照: [.storybook/mockBrowser.ts](../.storybook/mockBrowser.ts) の `records/search`（`serviceId` フィルタのみ）。Story 上でインクリメンタル検索（FR-21）の視覚検証がしづらい。

### 2.3 Medium

- **M1:** 検索対象フィールドが複数 `Button` のみで、`fieldset` / `aria-labelledby` 等のグループ化が弱い（[SearchBar.tsx](../src/entrypoints/content/ui/SearchBar.tsx)。`aria-pressed` は良い）。
- **M2:** ソート列に `aria-sort` や昇順/降順の非視覚情報がない（[RecordTable.tsx](../src/entrypoints/content/ui/RecordTable.tsx)）。
- **M3:** 状態分岐の Story が薄い（`loading` / `error` / 多行テーブル等）。[MainPanel.stories.tsx](../src/entrypoints/content/ui/MainPanel.stories.tsx) は `Default` のみ。Options も `Empty` / `WithConfigs` のみ。
- **M4:** Dialog 閉じる操作の SR 文言が英語（`Close`）（[dialog.tsx](../src/components/ui/dialog.tsx) の `sr-only`、`DialogFooter` の `showCloseButton` も英語）。
- **M5:** Pagination の `aria-label` が英語（[pagination.tsx](../src/components/ui/pagination.tsx)）。日本語 UI と混在。

### 2.4 Low

- **L1:** `total === 0` でも「1 / 1 ページ」表示で文言の納得感に余地（[PaginationControls.tsx](../src/entrypoints/content/ui/PaginationControls.tsx)）。
- **L2:** 検索入力の `autoFocus` がオーバーレイでホストのフォーカスを奪う可能性（[SearchBar.tsx](../src/entrypoints/content/ui/SearchBar.tsx)）。
- **L3:** Options「アプリ設定」タブはプレースホルダーのみ（[options/App.tsx](../src/entrypoints/options/App.tsx)）。
- **L4:** Radix focus guard によるホストページのガクつき（既知リスク、MainPanel 内コメント参照）。
- **L5:** トーストに技術エラー文字列を連結（MainPanel / Options の `toast.error`）。
- **L6:** Storybook `layout: centered` + 固定幅で極窄幅の折り返し検証が弱い（[preview.tsx](../.storybook/preview.tsx) および各 Story）。
- **L7:** Storybook キャンバスで MainPanel の「表示件数」付近が見切れやすい（ブラウザ実機確認）。
- **L8:** Options WithConfigs でカード下部アクションが下端で切れて見えることがある（ブラウザ実機確認）。

---

## 3. ユーザー視点（意図のわかりやすさ）

### 3.1 強い点

- **Card / Tabs / Popup / Options 空状態 / RecordTable NoFields / MainPanel の説明文**など、初見でも次の一手が読み取りやすい。
- **Popup** のステータスと `aria-live`（[popup/App.tsx](../src/entrypoints/popup/App.tsx)）は非同期結果のフィードバックとして妥当。

### 3.2 改善余地

- **PaginationControls の 0 件時**の「1/1 ページ」表現。
- **Options** の技術用語（`observeRootSelector` 等）は要件上やむをえない部分があるが、補助説明やツールチップがあると非エンジニア向けにより親切。
- **Storybook の Input / Textarea / Select** の一部 Story は**ラベルなし・プレースホルダのみ**で、カタログとしての「正しいフォーム例」になりにくい（`Label / WithInput` に揃えるとよい）。

---

## 4. アクセシビリティ（Story 単位の整理）

### 4.1 良い例

- **Label / WithInput:** `htmlFor` / `id` の関連付けが明確。
- **Switch / Default・Small:** `Label` + `id`。
- **SearchBar（実装）:** キーワードに `Label`、フィールドトグルに `aria-pressed`。
- **Radix 系（Dialog / Tabs / Select）:** キーボード操作の基盤はライブラリに依存しつつ期待どおり使える前提。

### 4.2 要改善・注意

| 対象 | 内容 |
| --- | --- |
| UI / Input（Default 等） | 可視ラベルなし。プレースホルダのみは WCAG 観点で注意。 |
| UI / Textarea | 同上。 |
| UI / Select / Default | 外付け `Label` なし。Story 教材価値を上げるなら追加。 |
| UI / Switch / Disabled | ラベル・`aria-label` なしで「何のスイッチか」が不明。 |
| UI / Button / Sizes | アイコンは `aria-label` あり（英語）。`xs` はタッチターゲットとして小さい。 |
| UI / Pagination | 視覚は Previous/Next（英語）。`nav` の `aria-label` も英語。 |
| UI / Dialog | 閉じるの SR 文言が英語。 |
| UI / Sonner / Playground | トリガーが Success/Info/Error（英語）、トースト本文は日本語で混在。 |
| Content / RecordTable | ソート状態の SR 表現（`aria-sort` 等）を強化できる。 |
| RecordTable / No Fields・Options 空状態 | muted テキストのコントラストは計測推奨。 |

---

## 5. 自動テストとの照合

| 領域 | 担保されていること | 薄い / なし |
| --- | --- | --- |
| E2E | Popup 切替・Options 開く・Options CRUD・メイン UI のキーワード・ページ送り・列クリックソート | Popup のコンポーネントテスト、Options のバリデーション/キャンセル、キーボード専用操作 |
| RTL | SearchBar（キーワード・1 フィールド）、Pagination、RecordTable（空・ソート）、Options（ダイアログオープンのみ） | MainPanel 統合、SearchBar のページサイズ、import/export UI |

---

## 6. ブラウザ（Storybook）での確認メモ

- **iframe プレビュー**のため、親ページの accessibility ツリーにキャンバス内ノードが列挙されないことが多い。見た目はスクリーンショット、一部は **Controls パネル**で補完。
- **ブラウザで実画面を確認した主な Story の例:** UI Dialog Default/Docs、Pagination Default、Switch Disabled、Input Default、Button Sizes、Sonner Playground、Label With Input、Select Default、Content MainPanel Default、SearchBar Default、RecordTable No Fields、Options Empty、PaginationControls Empty 等。
- **Dialog オープン後**の閉じるボタンの SR 文言は、ツリー取得が難しいため **ソース（dialog.tsx）を正**とした。

---

## 7. 改善提案（優先度の目安）

1. **Phase 5:** Options（または適切な画面）に **JSON エクスポート/インポート** UI と結果通知を追加し FR-40〜42・AC-05 に追従する。
2. **FR-33:** 検索・ソート用のキーボードショートカットを**仕様として固定**し実装・ヘルプ文言を同期する。
3. **`.storybook/mockBrowser.ts`:** `records/search` を簡易でもよいのでキーワード/対象フィールドに連動させ、Story 上でも検索の見た目が動くようにする。
4. **a11y 文言:** Dialog 閉じる、Pagination の `aria-label`、Sonner Playground のボタンを**日本語に統一**するか、製品用に props 化する。
5. **Story 追加:** MainPanel / Options の `loading`・`error`、多行テーブル、MainPanel のレイアウト見切れ解消用の `fullscreen`+余白 等。
6. **フォーム Story:** Input / Textarea / Select を **Label 付きパターン**をデフォルトに近づける。
7. **RecordTable:** `aria-sort` 等でソート状態を SR に伝える。
8. **SearchBar / MainPanel:** 検索対象フィールドを `fieldset`+`legend` または `role="group"`+`aria-labelledby` でグループ化する。

---

## 8. 参考パス一覧

| 種別 | パス |
| --- | --- |
| Storybook 設定 | `.storybook/main.ts`, `.storybook/preview.tsx`, `.storybook/mockBrowser.ts` |
| 業務 UI | `src/entrypoints/popup/App.tsx`, `src/entrypoints/options/App.tsx`, `src/entrypoints/content/ui/*.tsx` |
| 共有 UI | `src/components/ui/*` |
| E2E | `e2e/popup.spec.ts`, `e2e/optionsCrud.spec.ts`, `e2e/mainUiSearch.spec.ts` |
| 要件 | `docs/requirements.md` |
