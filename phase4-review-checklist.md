# Phase 4 レビュー由来チェックリスト（一時）

実装計画 §3.5・対象 FR（FR-21〜23, FR-30〜33）のレビューで挙げたフォローアップを整理したもの。完了したら `[ ]` を `[x]` に更新するか、本ファイルを削除してよい。

---

## P0（計画・ドキュメント・CI）

- [ ] **グローバル設定のスコープ整理**: Phase 4 完了に含めるなら `appSettings` の最小 UI と読み書きを実装する。含めないなら `implementation_plan.md` / `implementation_guide.md` / Options の「グローバル設定」タブ文言を「後続フェーズ」に揃え、矛盾を解消する。
- [ ] **[repository.mdc](.cursor/rules/repository.mdc) 更新**: Options が「Phase 4 で追加予定」など現状と矛盾する記述を直す。
- [ ] **`pnpm check` 失敗の解消**: `.cursor/mcp.json` の Biome フォーマット差分を直すか、プロジェクト方針に応じてチェック対象から除外する（CI / NFR-31 との整合）。

---

## P1（要件・バグ・UX・テスト）

- [ ] **Options 保存/削除失敗時の二重トースト解消**: `useServiceConfigStore` の `error` と `handleSaveConfig` / `handleDeleteConfig` の `toast.error` が重複しないよう一方に寄せる。
- [ ] **検索 `search()` のレース対策**: デバウンス後の複数リクエストで古い応答が上書きしないよう、リクエスト ID や同等の仕組みを検討・実装する。
- [ ] **検索対象フィールド全オフ時**: `targetFieldNames` が空のとき、前回 `result` をクリアするか、ユーザー向けに状態を明示する。
- [ ] **FR-31（Options 編集）の E2E**: 既存設定を編集して保存するシナリオを `e2e` に 1 本追加する。

---

## P2（任意・強化）

- [ ] **FR-33**: キーボードのみ（またはショートカット）でのソート・ページ操作を E2E または仕様/ヘルプに明示する。
- [ ] **MainPanel 結合テスト**: `runtime.sendMessage` をモックし、デバウンス・エラー通知・主要フローを Vitest でカバーする。
- [ ] **FR-32 の厳密化**: Popup の成功/失敗もトーストに揃える（要件解釈を Popup まで含める場合）。
- [ ] **AC-02（性能）**: 5,000 件前提の簡易ベンチまたは手動検証手順を用意する。
- [ ] **AC-03 補強**: ひらがな/カタカナ・全半角を含む検索の E2E を追加する（任意）。
- [ ] **クロスタブ同期**: メイン UI 表示中に Options で設定を変えたときの挙動（再取得のタイミング）を仕様化し、必要なら `fetchConfigs` の再実行経路を追加する。

---

## 共通 DoD・トレーサビリティ（確認用）

- [ ] Phase 4 対象のコンポーネントテストが「フォーム / 一覧 / 通知」の不足分を埋め、意図した範囲で十分か判断する。
- [ ] `requirements.md` / `implementation_plan.md` / `implementation_guide.md` と実装の齟齬が残っていないか最終確認する。
- [ ] `pnpm test` / `pnpm e2e` / `pnpm check` / `pnpm lint-md` がプロジェクト方針どおり通る状態にする。

---

## 以前のレビューで列挙した関連項目（参照）

- [ ] `validateSearchQuery` と UI の `targetFieldNames` 空状態の見せ方の一貫性（API は空配列不可のまま）。
- [ ] Content script の `matches: ["<all_urls>"]` と NFR-21（最小権限）の見直しはリリース前の別タスクとして扱うか記録する。
