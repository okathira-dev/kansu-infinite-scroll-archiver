# WXT 開発モードのデバッグ・動作確認

本書は [WXT](https://wxt.dev/) の公式ドキュメントに沿って、`pnpm dev` での開発・デバッグ手順をまとめたものです。  
Kansu 固有として、**Manifest V3 の Service Worker** と **IndexedDB（Dexie）** の確認ポイントも記載します。

## 公式ドキュメント（参照先）

- 開発サーバの起動と次のステップ: [Installation – Demo / Next Steps](https://wxt.dev/guide/installation.html)
- プロジェクト構成（本リポジトリは `srcDir: "src"`）: [Project Structure – Adding a src/ Directory](https://wxt.dev/guide/essentials/project-structure.html#adding-a-src-directory)
- 開発時のブラウザ起動・プロファイル永続化など: [Browser Startup](https://wxt.dev/guide/essentials/config/browser-startup.html)
- CLI 全体: [wxt（コマンドリファレンス）](https://wxt.dev/api/cli/wxt.html)
- 設定の網羅: [WXT Config API](https://wxt.dev/api/config.html)

## 前提と起動

- Node.js / pnpm は [README.md](../README.md) の前提に従う。
- 開発モード起動:

```bash
pnpm dev
```

公式の説明どおり、WXT は [web-ext](https://www.npmjs.com/package/web-ext) 経由でブラウザを開き、拡張を読み込んだ状態で起動します。  
Firefox で fixture 付き起動を試す場合は `pnpm dev:firefox`。拡張だけ起動したい場合は `pnpm dev:extension` / `pnpm dev:extension:firefox` を使う。

### CLI オプション（公式）

`wxt --help` で一覧確認できます。例:

- `-b, --browser <browser>` … ブラウザ指定（`chrome` / `firefox` / `edge` 等）
- `--debug` … デバッグモード
- `--level <level>` … ログレベル

詳細は [wxt – CLI](https://wxt.dev/api/cli/wxt.html) を参照。

## ビルド成果物の場所

- 既定の出力先は **`.output/`**（[Project Structure](https://wxt.dev/guide/essentials/project-structure.html)）。
- 手動で「パッケージ化されていない拡張機能を読み込む」場合も、通常は **`.output/chrome-mv3-dev`**（環境・WXT 版により末尾が異なる場合あり）配下を指定します。  
  実際のパスは `pnpm dev` 実行時のターミナル出力を確認するのが確実です。

## ブラウザ・プロファイル（公式と本リポジトリ）

[Browser Startup](https://wxt.dev/guide/essentials/config/browser-startup.html) にあるとおり、**既定では web-ext が一時プロファイルを使う**ため、`pnpm dev` を止めるたびにプロファイルが捨てられ、IndexedDB 等もリセットされやすいです。

- **データを dev セッション間でも残したい**（IndexedDB の検証を楽にする等）場合は、公式の **Persist Data** の例のとおり、`web-ext.config.ts` で Chromium のユーザデータディレクトリを指定します。
- 本リポジトリの [`.gitignore`](../.gitignore) では **`web-ext.config.ts` を無視**しているため、個人環境用の設定を置いてもリポジトリにコミットされません。  
  チームで共有する場合は `wxt.config.ts` の `webExt` で設定する方法が [Browser Startup](https://wxt.dev/guide/essentials/config/browser-startup.html) に記載されています。

## Service Worker（Background）のデバッグ

Kansu の Background は `src/entrypoints/background.ts` で、**`runtime.onMessage` を `MessageRouter` に集約**しています。IndexedDB へのアクセスもここ経由です。

### Chrome での開き方

1. `chrome://extensions` を開く。
2. 「デベロッパーモード」を有効にする。
3. 当該拡張の **「Service Worker」**（または「バックグラウンド ページ」表記がない場合はリンク名は環境依存）をクリックし、**DevTools を開く**。

### 確認したいこと

- **コンソールエラー**: メッセージ処理や Dexie の例外が出ていないか。
- **非同期レスポンス**: `onMessage` で `return true` と `sendResponse` の組み合わせは [Chrome のメッセージング](https://developer.chrome.com/docs/extensions/develop/concepts/messaging) に準拠。ハングや未応答がないか。
- **ライフサイクル（MV3）**: Service Worker は**アイドルで停止**し得ます。停止後も次のメッセージで再初期化され、`getKansuDb()` はモジュール再実行に伴い新しい接続を取り直す想定です。  
  永続状態は **IndexedDB** に置く設計です（`docs/implementation_guide.md` の MV3 前提・`NFR-10`）。

### メッセージの手動テスト（Popup / Content / Options のコンソール）

`runtime.sendMessage` の手動テストは、**送信元を Service Worker 以外の拡張コンテキスト**（Popup / Content / Options）にします。  
Service Worker の DevTools コンソールから自分自身に `sendMessage` すると、環境によっては受信先が見つからず `Could not establish connection. Receiving end does not exist.` になります。

#### なぜそうなるか（Chrome の仕様）

- Chrome の `runtime.sendMessage` は、同一拡張へ送る場合でも **sender 自身のフレームには配送されません**（`except for the sender's frame`）。
- Kansu では `runtime.onMessage` の受信口を `src/entrypoints/background.ts` の Service Worker に集約しているため、**Service Worker 自身から送ると受信側が存在しない**状態になりえます。
- 参照: [chrome.runtime.sendMessage()](https://developer.chrome.com/docs/extensions/reference/api/runtime#method-sendMessage)

検証用に、パース済みペイロードで `sendMessage` する例（型・プロパティ名は `src/lib/messages/contracts.ts` と一致させる）:

```js
chrome.runtime.sendMessage(
  {
    type: "configs/list",
  },
  (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
      return;
    }
    console.log(response);
  },
);
```

`browser` グローバルが使える環境では `browser.runtime.sendMessage` でも可。  
Service Worker 側は **受信ログ・例外確認**のためにコンソールを開いておく、という使い分けが実運用で安定します。

## Content Script（抽出エンジン）のデバッグ

対象ページに注入される **抽出エンジン**の構成は次のとおりです。

| 項目 | 内容 |
| --- | --- |
| エントリ | `src/entrypoints/content/index.ts`（`matches: ["<all_urls>"]`） |
| 本体 | `src/entrypoints/content/engine.ts` の `startContentEngine()` |
| 補助 | URL 一致（`urlPatternMatcher.ts`）、抽出（`fieldExtractor.ts` / `recordExtractor.ts`）、mutation バッチ（`mutationBatchProcessor.ts`）、検索用文字列（`textNormalization.ts`） |

ページを開き拡張が有効なら、**開発者がコンソールに何も打たなくても** Content Script が起動し、下記のとおり `configs/list` や `records/bulkUpsert` をコードから送る。挙動を追うときはログ・IndexedDB・Service Worker のコンソールを見る。メッセージ経路やペイロードだけ切り分けたいときは、上文「メッセージの手動テスト（Popup / Content / Options のコンソール）」と同様に、開発者が Popup や Content script コンテキストで `chrome.runtime.sendMessage(...)` をコンソールに貼って実行する。設定の投入は別項の `configs/save` 例のとおり手動送信する。

### 通常動作の流れ

次の番号付きは、**拡張（Content Script / Background）がページ読み込みから自動で行う処理**の順である。ここに出てくる `sendMessage` はいずれもコードが実行するもので、開発者がコンソールに打つ必要はない。

1. Content Script が注入され、`index.ts` の `main` が `startContentEngine()` を呼ぶ。
2. `engine.ts` 内で **`browser.runtime.sendMessage({ type: "configs/list" })`** が実行され、Background（`MessageRouter`）が IndexedDB から設定一覧を返す。
3. 返った一覧から、**`enabled === true` かつ `urlPatterns` が現在の `location.href` に一致する**最初の 1 件だけを採用する。該当がなければ **何もしない**（コンソールにも出さない）。
4. `observeRootSelector` でルート要素を解決できなければ **`Kansu: 監視ルートが見つかりません`** を警告して終了する。
5. ルート配下の `itemSelector` からアイテムを列挙し、各 `FieldRule` で値を取り出す。`uniqueKeyField` が空のアイテムは保存対象から除外する。
6. 抽出結果が 1 件以上あれば、コードから **`records/bulkUpsert`** を送る。DOM 変更は `MutationObserver` で受け、**約 200ms の遅延でまとめて**再抽出する（高頻度 mutation の過剰実行を抑える）。
7. ページ離脱時に `pagehide` でオブザーバとバッチ処理を止める。

**開発者が手動で `configs/list` だけ試したい場合**は、拡張コンテキストのコンソールから、上文「メッセージの手動テスト」のコード例と同じ `sendMessage` を実行すればよい（ページを開かなくても Background の応答だけ確認できる）。

### コンソールの開き方（Chrome）

ログは勝手に目に入らないため、**開発者**が次のように DevTools を開き、コンテキストを切り替える。

- **Content Script のログ**（`Kansu:` で始まる `console.error` / `console.warn`）は、**対象サイトのタブ**で DevTools を開き、コンソール上部の **実行コンテキスト**を拡張機能の **Content script**（拡張名が表示される）に切り替えると見やすい。`top` のままだと Content Script のログが混ざらない・見えない場合がある。
- **Service Worker 側**では、`chrome://extensions` から Service Worker の DevTools を開き、`bulkUpsert` や Dexie の例外が出ていないかを併せて確認する。

### 設定が無いときの事前準備（手動で `configs/save`）

通常のページ閲覧だけでは IndexedDB にサービス設定が無いことが多く、その場合 **Content Script は何もしない**。設定を入れたい **開発者**は次を実行する。

Options UI が未整備の間は、**拡張のコンテキスト**（Popup を検証表示した DevTools、またはページ上でコンソールを Content script に切り替えた状態）から、次のように **`chrome.runtime.sendMessage` をコンソールに貼り付けて**設定を保存する。`urlPatterns` は **いま開いているページの URL** と一致させる（ワイルドカード `*` 可。`<all_urls>` も可）。

```js
chrome.runtime.sendMessage(
  {
    type: "configs/save",
    payload: {
      id: "service-debug-1",
      name: "Debug",
      urlPatterns: ["https://example.com/*"],
      observeRootSelector: "body",
      itemSelector: ".item",
      uniqueKeyField: "id",
      fieldRules: [
        { name: "id", selector: ".id", type: "text" },
        { name: "title", selector: ".title", type: "text" },
        { name: "thumbnail", selector: ".thumb", type: "imageUrl" },
        { name: "digits", selector: ".title", type: "regex", regex: "(\\d+)" },
      ],
      enabled: true,
      updatedAt: new Date().toISOString(),
    },
  },
  (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
      return;
    }
    console.log(response);
  },
);
```

保存後、**開発者が対象タブをリロード**する（Content Script はページ読み込み時に起動する。手動 `save` だけでは、すでに注入済みのタブでは Content Script は自動では再実行されない）。`VALIDATION_ERROR` が返る場合は `src/lib/types/validation.ts` の `validateServiceConfig` に沿って必須項目・`uniqueKeyField` と `fieldRules[].name` の整合を直す。

上の `example.com` 用ペイロードはスキーマ確認向きで、**実 DOM には `.item` が無い**ため、そのままでは抽出件数は増えない。

### 実サイト例: Hacker News（トップの記事一覧）

**サイト**: [https://news.ycombinator.com/](https://news.ycombinator.com/)

#### 手順の概要

1. 拡張コンテキストのコンソールで、下の `configs/save` を実行する（`updatedAt` は実行時の ISO 文字列に置き換えてよい）。
2. **Hacker News のタブを開いた状態で**そのタブをリロードする（`urlPatterns` が一致し、Content Script が起動する）。
3. Popup 等の DevTools から IndexedDB の `records` を見て、`serviceId` が `service-hn-demo` の行が増えているか確認する。

**設定例（`configs/save` の `payload`）**

```js
chrome.runtime.sendMessage(
  {
    type: "configs/save",
    payload: {
      id: "service-hn-demo",
      name: "Hacker News (demo)",
      urlPatterns: ["*://news.ycombinator.com/*"],
      observeRootSelector: "#bigbox table",
      itemSelector: "tr.athing",
      uniqueKeyField: "link",
      fieldRules: [
        { name: "link", selector: "span.titleline > a", type: "linkUrl" },
        { name: "title", selector: "span.titleline > a", type: "text" },
      ],
      enabled: true,
      updatedAt: new Date().toISOString(),
    },
  },
  (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
      return;
    }
    console.log(response);
  },
);
```

#### 補足

- `observeRootSelector` が見つからないときはコンソールに `Kansu: 監視ルートが見つかりません` が出る。その場合は DevTools で一覧テーブルのセレクタを確認し、`#bigbox table` や `table.itemlist`、`body` など実在するルートに変えて再度 `configs/save` する。
- Hacker News のトップは無限スクロールではなくページ送りが多い。**別ページへ遷移すると**ページ全体が読み込み直され、Content Script も再度走る。無限スクロールの再抽出確認は、別のサイトで同様にセレクタを合わせる必要がある。

### E2E と同じ固定サンプルページで手動デバッグする

実サイト依存を避けて切り分けたい場合は、E2E と同じ固定ページを使う。対象ファイルは `debug-fixtures/infinite-scroll.html` で、E2E でも同一ファイルを読み込んでいる。

#### 最短手順（推奨）

1. `pnpm dev` を実行する。
1. fixture サーバ起動後に、`wxt.config.ts` の `webExt.startUrls`（`KANSU_DEV_OPEN_FIXTURE=1` のときのみ有効）により、WXT が起動したブラウザ内で `http://127.0.0.1:41731/kansu-e2e/infinite-scroll` が開くことを確認する。
1. 開発ビルドでは、`service-e2e-manual` 設定が未登録のときだけ自動投入されるため、そのまま対象タブをリロードして抽出確認へ進める。

`pnpm dev` / `pnpm dev:firefox` は `concurrently` で `pnpm debug:fixture` と `pnpm dev:extension`（または `pnpm dev:extension:firefox`）を並列実行する。`cross-env KANSU_DEV_OPEN_FIXTURE=1` により、WXT 側だけ `webExt.startUrls` が有効になる（fixture サーバはこの変数を参照しない）。  
fixture ポートは環境変数 **`FIXTURE_PORT`** で指定し、未設定なら `41731`。他ツールの `PORT` と衝突しやすいため、本リポジトリでは **`FIXTURE_PORT` に統一**する。指定ポートが既に使われている場合は `EADDRINUSE` で失敗する（別プロセスを止めるか `FIXTURE_PORT` を変える）。  
例（PowerShell）: `$env:FIXTURE_PORT=41800; pnpm dev`。bash 例: `FIXTURE_PORT=41800 pnpm dev`。  
拡張だけを起動したい場合は `pnpm dev:extension` または `pnpm dev:extension:firefox` を使う。

#### 手動手順（挙動を分離して検証したい場合）

1. ターミナルで fixture サーバを起動する。

```bash
pnpm debug:fixture
```

1. ブラウザで `http://127.0.0.1:41731/kansu-e2e/infinite-scroll` を開く。
1. 拡張コンテキストのコンソールで、次の `configs/save` を実行する。
1. 対象タブをリロードし、初回抽出で `records` が増えることを確認する。
1. ページ上の `Add item` ボタンを押し、再抽出で件数が増えることを確認する（`MutationObserver` + バッチの確認）。

```js
chrome.runtime.sendMessage(
  {
    type: "configs/save",
    payload: {
      id: "service-e2e-manual",
      name: "E2E Manual Fixture",
      urlPatterns: ["http://127.0.0.1:*/kansu-e2e/*"],
      observeRootSelector: "#feed",
      itemSelector: ".item",
      uniqueKeyField: "link",
      fieldRules: [
        { name: "link", selector: ".link", type: "linkUrl" },
        { name: "title", selector: ".title", type: "text" },
        { name: "thumbnail", selector: ".thumb", type: "imageUrl" },
        { name: "digits", selector: ".title", type: "regex", regex: "(\\d+)" },
      ],
      enabled: true,
      updatedAt: new Date().toISOString(),
    },
  },
  (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
      return;
    }
    console.log(response);
  },
);
```

#### 補足（固定サンプルページ）

- fixture の `.title` は日本語/英語/日英混在の固定ローテーション（例: `日本語タイトル`, `English headline`, `日本語 and English`）で生成される。検索正規化の手動確認時は、かな統一・英字保持・NFKC の効き方をこの混在タイトルで確認する。
- fixture サーバのポートを変えたい場合は `FIXTURE_PORT` を設定して起動する（bash 例: `FIXTURE_PORT=41800 pnpm debug:fixture` / PowerShell 例: `$env:FIXTURE_PORT=41800; pnpm debug:fixture`）。
- 自動投入および上記例の `urlPatterns` は `http://127.0.0.1:*/kansu-e2e/*` とし、**ポート番号に依存しない**。`pnpm dev` ではシェルから渡した `FIXTURE_PORT` が `serve-e2e-fixture.mjs` と `wxt.config.ts` の `webExt.startUrls` の両方に効く。ポート競合時はエラーで終了する。
- 404 になる場合は `pnpm debug:fixture` のターミナルに表示された URL を優先する。
- 固定ページで期待どおり動くのに実サイトで動かない場合は、サイト側 DOM（セレクタ）差分が原因である可能性が高い。

### 抽出・保存が動いているかの見極め

- **開発者**は、下記「IndexedDB（Dexie）の確認」のとおり DevTools で `records` に行が増えるか確認する。初回は上記の手動 `configs/save` で少なくとも 1 件書き込んでおくと DB が作成されやすい。
- **拡張**は、無限スクロールで DOM が連続追加されても、抽出処理を **最大でも遅延間隔ごと**にまとめて実行する。**開発者**はページでスクロールしながら、即時に毎ノードで `bulkUpsert` が飛ばないことを確認する。
- **開発者**は、抽出ロジック・URL 一致・バッチの回帰を `pnpm test` の `src/entrypoints/content/*.test.ts` で確認する。

### 性能計測（NFR-01 / NFR-02）

Phase 6 では開発時の計測ログを `globalThis.__KANSU_DEV_PERF_METRICS__` に蓄積する。

- `search-response`: `records/search` の応答反映まで（`src/lib/stores/searchStore.ts`）
- `content-extraction`: 抽出〜保存要求まで（`src/entrypoints/content/engine.ts`）

手動で p95 を確認したいときは、Content script コンテキストのコンソールで次を実行する。

```js
const metrics = globalThis.__KANSU_DEV_PERF_METRICS__ ?? [];
const pickP95 = (name) => {
  const values = metrics
    .filter((metric) => metric.name === name)
    .map((metric) => metric.durationMs)
    .sort((a, b) => a - b);
  if (values.length === 0) {
    return null;
  }
  const index = Math.min(values.length - 1, Math.floor(values.length * 0.95));
  return values[index];
};
console.log({
  searchP95: pickP95("search-response"),
  extractionP95: pickP95("content-extraction"),
  totalSamples: metrics.length,
});
```

`Add 1000 items` を複数回実行して 5,000 件程度まで増やし、`searchP95`（目標 300ms）と `extractionP95` の推移を確認する。

## IndexedDB（Dexie）の確認

### データベース名・ストア

実装は `src/lib/db/kansuDb.ts` を参照。

| 項目 | 内容 |
| --- | --- |
| DB 名（既定） | `kansu-archive` |
| オブジェクトストア | `serviceConfigs`, `records`, `appSettings` |
| レコード主キー | `records` は複合キー `[serviceId+uniqueKey]`（Dexie スキーマ参照） |

### DevTools での見え方

1. **Popup（または Options / 拡張ページ）の DevTools** を開き、**Application**（または **ストレージ**）パネルを開く。
2. **IndexedDB** → `chrome-extension://<拡張ID>/` 配下に **`kansu-archive`** が表示されることを確認する。
3. `serviceConfigs` / `records` に、メッセージ経由で保存した行が増えるか確認する。
4. Service Worker 側 DevTools は、保存処理のエラー有無とメッセージ受信ログ確認に使う。

#### なぜ Service Worker 側で見えないことがあるか

- Extension Service Worker から IndexedDB を使うこと自体は想定どおりです（Chrome 公式の Service Worker ライフサイクル説明でも永続化手段として IndexedDB が挙がる）。
- ただし DevTools の IndexedDB 表示は、実運用上 **「いま検査しているターゲット/ページ文脈」依存**で、Service Worker の DevTools では `No IndexedDB detected` になるケースがあります。
- そのため、**データの可視確認は Popup / Options 側 DevTools を優先**し、Service Worker 側はログ確認に使うのが安定です。
- 参照:
  - [Extension service worker lifecycle（Persist data）](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)
  - [View and change IndexedDB data（DevTools）](https://developer.chrome.com/docs/devtools/storage/indexeddb/)
  - [Chromium Extensions thread: worker DevTools では storage が見えない事例](https://groups.google.com/a/chromium.org/g/chromium-extensions/c/iMmV93LyNjI)

**注意**: 拡張 ID はプロファイルや読み込み方によって変わります。一覧は `chrome://extensions` の当該拡張の詳細から確認できます。

### よくあるつまずき

- **Service Worker 側で `No IndexedDB detected` が出る**: Chrome の表示仕様やタイミングにより、SW DevTools の Application では見えないことがあります。Popup/Options 側の DevTools で確認してください。
- **DB が一覧に出ない**: 初回書き込み前は DB が作成されていない可能性があります。`configs/save` などで1件保存後に再確認してください。
- **dev を再起動するとデータが消える**: 上記の **Persist Data**（[Browser Startup](https://wxt.dev/guide/essentials/config/browser-startup.html)）未設定のとき、一時プロファイル破棄で消えます。

## ソースマップとホットリロード

- WXT の dev ビルドではソースマップが有効になりやすく、Service Worker / Popup / Content Script のスタックトレースから TypeScript 元行に近い位置へジャンプしやすいです。
- ファイル保存後のリロード挙動は WXT 版に依存します。反映されない場合は `chrome://extensions` の **「更新」** や、一度拡張の **無効→有効** も試してください。

## 自動テストとの役割分担

- **永続化・検索の回帰**は `pnpm test`（Vitest）の Repository テストでカバーします。
- **実ブラウザでの IndexedDB・SW 挙動**は本書の手順または `pnpm e2e`（Playwright）で補います。

## 関連ドキュメント（リポジトリ内）

- [実装ガイド](implementation_guide.md) … アーキテクチャ・メッセージ契約・IndexedDB 方針
- [実装計画](implementation_plan.md) … フェーズ計画
- [要件定義](requirements.md) … `FR-*` / `NFR-*`
