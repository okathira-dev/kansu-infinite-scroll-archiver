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
Firefox で試す場合は `pnpm dev:firefox`（`package.json` のスクリプト）。

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

- WXT の dev ビルドではソースマップが有効になりやすく、Service Worker / Popup のスタックトレースから TypeScript 元行に近い位置へジャンプしやすいです。
- ファイル保存後のリロード挙動は WXT 版に依存します。反映されない場合は `chrome://extensions` の **「更新」** や、一度拡張の **無効→有効** も試してください。

## 自動テストとの役割分担

- **永続化・検索の回帰**は `pnpm test`（Vitest）の Repository テストでカバーします。
- **実ブラウザでの IndexedDB・SW 挙動**は本書の手順または `pnpm e2e`（Playwright）で補います。

## 関連ドキュメント（リポジトリ内）

- [実装ガイド](implementation_guide.md) … アーキテクチャ・メッセージ契約・IndexedDB 方針
- [実装計画](implementation_plan.md) … フェーズ計画
- [要件定義](requirements.md) … `FR-*` / `NFR-*`
