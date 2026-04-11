# ストレージと DB 設計

Kansu がブラウザ内でどのようにデータを永続化するか、現行スキーマの意図、RDB との対応関係をまとめる。実装の最終的な正本は
[requirements.md の「4. 機能要件（MVP）」](requirements.md#4-機能要件mvp) /
[「5. 非機能要件」](requirements.md#5-非機能要件)・ソースコード・テストであり、実装時は
[implementation_guide.md の「1. このドキュメントの目的」](implementation_guide.md#1-このドキュメントの目的)
を補助的に参照する。

## 目的とスコープ

- 抽出結果とサービス設定をローカル保存に限定する方針は、
  [requirements.md の「5.3. セキュリティ・プライバシー」](requirements.md#53-セキュリティプライバシー)
  の NFR-20 に従う。
- 永続化方式として IndexedDB を使う理由は、
  [requirements.md の「4.3. データ保存・検索・表示」](requirements.md#43-データ保存検索表示)
  の FR-20、
  [「4.5. インポート/エクスポート」](requirements.md#45-インポートエクスポート)
  の FR-40 / FR-41、
  [「5.1. パフォーマンス」](requirements.md#51-パフォーマンス)
  の NFR-04、
  [「5.2. 信頼性」](requirements.md#52-信頼性)
  の NFR-12 を同時に満たすため。
- MV3 拡張で IndexedDB が Service Worker から利用可能である点は
  [Chrome Extensions: Storage and cookies](https://developer.chrome.com/docs/extensions/mv3/storage-and-cookies)
  を前提にしている。

本書は IndexedDB の設計意図に集中する。開発時の DevTools 操作は
[wxt-dev-debug.md の「IndexedDB（Dexie）の確認」](wxt-dev-debug.md#indexeddbdexieの確認)
を参照する。

## 現行設計の要約

### データベース名とオブジェクトストア

実装の単一ソースは
[`src/lib/db/kansuDb.ts`](../src/lib/db/kansuDb.ts)。
データベース名のデフォルトは `kansu-archive` で、Dexie の `stores` 宣言は次のとおり。

```ts
this.version(1).stores({
  serviceConfigs: "&id, enabled, updatedAt",
  records: "&[serviceId+uniqueKey], serviceId, extractedAt",
  appSettings: "&id",
});
```

| オブジェクトストア | 主な役割                                               |
| ------------------ | ------------------------------------------------------ |
| `serviceConfigs`   | サービス設定（1 行 1 サービス）。主キー `id`。         |
| `records`          | 抽出レコード。複合主鍵 `serviceId` + `uniqueKey`。     |
| `appSettings`      | アプリ全体の追加設定（キー・値）。                     |

### `records` のキーとインデックス

- 1 行のペイロードは `ExtractedRecord` に対応する。可変フィールドは `fieldValues: Record<string, { raw, normalized }>` にまとめ、全文結合した検索用テキスト列は持たない。キーワード検索は `SearchQuery.targetFieldNames` で指定した名前の `normalized` のみを対象とする（実装・要件は `implementation_guide.md` のデータモデル節と `requirements.md` の `FR-21` を参照）。
- 複合主鍵 `serviceId` + `uniqueKey` は、Dexie の複合キー構文
  `[a+b]`（例: `&[serviceId+uniqueKey]`）に対応する。
  仕様は
  [Dexie: Compound Index](https://dexie.org/docs/Compound-Index)
  を参照。
- `serviceId` インデックスでサービス単位に絞って検索し、一覧・検索の入口を固定する。
  実装は
  [`src/lib/repositories/recordRepository.ts`](../src/lib/repositories/recordRepository.ts)
  に集約している。

### ランタイムとテスト

本番ではブラウザの IndexedDB を利用し、テストでは `fake-indexeddb` を注入して同じ経路を検証する
（[`src/lib/db/kansuDb.ts`](../src/lib/db/kansuDb.ts) 先頭コメント）。
IndexedDB の API 概念（DB / Object Store / Transaction）は
[MDN: Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
を基準に読む。

## 設計意図

### 固定ストアとバージョン管理

オブジェクトストア構成は固定とし、ユーザー設定数に応じた動的ストア増設は行わない。
根拠は、Object Store 作成 API の
[`createObjectStore()` が versionchange トランザクション内でのみ呼べる](https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/createObjectStore)
という IndexedDB 制約と、
[`upgradeneeded` イベントでスキーマ更新が走る](https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/upgradeneeded_event)
モデルにある。

このため、可変にする対象は「ストア種類」ではなく「行データ」とし、マイグレーションの軸を単純化している。

### 全サービスのレコードを 1 ストアに載せる

論理テナントは `serviceId` 列と複合主鍵の先頭要素で表現する。
RDB でいえば「テナント ID 付き単一テーブル」に近い設計。
DevTools 上は 1 ストアに全行が並ぶが、アプリ側では `serviceId` で絞るクエリを基本とする
（実装:
[`recordRepository.ts`](../src/lib/repositories/recordRepository.ts)）。

### Dexie は実装技術であり、ドメイン設計とは分けて判断する

Dexie のドキュメントは IndexedDB の利用しやすさ（複合キー、インデックス、トランザクション）を説明するもので、
プロダクトの境界設計そのものを決定するものではない
（[Dexie: Getting started](https://dexie.org/docs/Tutorial/Getting-started)、
[Dexie: Compound Index](https://dexie.org/docs/Compound-Index)）。

「サービスごとに物理分離したい」という要件が強い場合は、以下の選択肢もある。

- サービスごとに DB 名を分ける: `indexedDB.open(name, version)` の
  `name` 単位で分離可能（
  [MDN: IDBFactory.open()](https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/open)
  ）。
- ブラウザ内 SQLite を使う:
  [Chrome Developers: SQLite Wasm + OPFS](https://developer.chrome.com/blog/sqlite-wasm-in-the-browser-backed-by-the-origin-private-file-system)
  のような構成があるが、Worker / ヘッダー / 互換性の考慮が増える。
  特に OPFS の同期ハンドルは
  [Dedicated Worker 限定](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createSyncAccessHandle)
  である点に注意。

現行の Kansu は、要件と運用コストのバランスから「単一 DB + 複合キー」で運用している。

## 一般的な RDB との対応と違い

### 対応しやすい概念

- Object Store は、役割としては RDB のテーブルに近い
  （[MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)）。
- インデックスは RDB の索引と同様に検索効率を担う
  （[MDN: Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)）。
- トランザクションで複数操作の整合性を扱える
  （[MDN: IDBTransaction](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction)）。
- 複合主キー相当の表現が可能（例: `&[serviceId+uniqueKey]`）
  （[Dexie: Compound Index](https://dexie.org/docs/Compound-Index)）。

### 相違しやすい点

- SQL がないため、クエリ計画は API 呼び出しとアプリ側ロジックで構築する
  （[MDN: Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)）。
- クライアント保存は、ユーザー操作や環境要因で失敗・消失しうる。
  エラーハンドリング前提で設計する必要がある
  （[web.dev: IndexedDB best practices](https://web.dev/articles/indexeddb-best-practices)）。
- MV3 Service Worker は停止・再開されるため、グローバル変数のみを状態源にしない
  （[Chrome: Extension service worker lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)）。

## 実装時チェックリスト（モダンな IndexedDB 実務論点）

- 書き込み失敗（容量不足・プライベートモード等）を前提に、失敗時の復旧パスを持つ
  （[web.dev](https://web.dev/articles/indexeddb-best-practices)）。
- ユーザーによる削除・改変、古いスキーマからの移行を想定して upgrade パスをテストする
  （[web.dev](https://web.dev/articles/indexeddb-best-practices)、
  [MDN: upgradeneeded](https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/upgradeneeded_event)）。
- 大きすぎるオブジェクトを 1 レコードへ詰め込まず、更新単位を細かく分ける
  （[web.dev](https://web.dev/articles/indexeddb-best-practices)、
  [MDN: structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)）。
- 拡張の Service Worker では `localStorage` が使えないため、IndexedDB / `chrome.storage` を用途別に使い分ける
  （[Chrome: Storage and cookies](https://developer.chrome.com/docs/extensions/mv3/storage-and-cookies)）。

このチェックリストは「必ずストア分割せよ」といった単一解を示すものではない。
テナント境界の切り方は、要件（分離強度、移行コスト、検索要件、運用体制）に合わせて選定する。

## 参考文献・リンク一覧

- [requirements.md の「4. 機能要件（MVP）」](requirements.md#4-機能要件mvp)
- [requirements.md の「5. 非機能要件」](requirements.md#5-非機能要件)
- [implementation_guide.md の「1. このドキュメントの目的」](implementation_guide.md#1-このドキュメントの目的)
- [wxt-dev-debug.md の「IndexedDB（Dexie）の確認」](wxt-dev-debug.md#indexeddbdexieの確認)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN: Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [MDN: IDBDatabase.createObjectStore()](https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/createObjectStore)
- [MDN: IDBOpenDBRequest upgradeneeded event](https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/upgradeneeded_event)
- [MDN: IDBFactory.open()](https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/open)
- [MDN: FileSystemFileHandle.createSyncAccessHandle()](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createSyncAccessHandle)
- [MDN: structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)
- [web.dev: Best Practices for Persisting Application State with IndexedDB](https://web.dev/articles/indexeddb-best-practices)
- [Dexie: Getting started](https://dexie.org/docs/Tutorial/Getting-started)
- [Dexie: Compound Index](https://dexie.org/docs/Compound-Index)
- [Chrome Extensions: Storage and cookies](https://developer.chrome.com/docs/extensions/mv3/storage-and-cookies)
- [Chrome Extensions: extension service worker lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)
- [Chrome Developers: SQLite Wasm in the browser backed by OPFS](https://developer.chrome.com/blog/sqlite-wasm-in-the-browser-backed-by-the-origin-private-file-system)
