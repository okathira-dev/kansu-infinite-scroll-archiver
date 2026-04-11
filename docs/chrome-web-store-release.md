# Chrome Web Store リリース手順（Kansu）

この文書は、**開発者がローカルでコマンドを実行し**、ビルド成果物を Chrome Web Store に提出するまでの手順と、ストア周りの要点をまとめたものです。ストア掲載文案の最終稿やプライバシーポリシー URL のホスティングはリポジトリ外の判断が伴います。

## Chrome Web Store の流れ（概要）

公開までのおおまかな順序は次のとおりです。

1. **開発者登録** … [Chrome デベロッパー ダッシュボード](https://chrome.google.com/webstore/devconsole) に初回アクセスし、規約同意と**一回限りの登録料**の支払いが必要です。詳細は [Register your developer account](https://developer.chrome.com/docs/webstore/register) を参照してください。料金額は支払い画面の表示に従ってください。
2. **アカウント設定** … [Set up your developer account](https://developer.chrome.com/docs/webstore/set-up-account)
3. **拡張の準備** … manifest・テスト・ZIP など。[Prepare your extension](https://developer.chrome.com/docs/webstore/prepare)
4. **アップロード** … ZIP をダッシュボードにアップロード。[Publish in the Chrome Web Store](https://developer.chrome.com/docs/webstore/publish)
5. **各タブの入力** … Store Listing / Privacy / Distribution /（必要なら）Test instructions
6. **審査提出** … Submit for review。審査後、即時公開か遅延公開かを選べます（[Publish 文書の Deferred publishing](https://developer.chrome.com/docs/webstore/publish)）。

**制約の例**（公式 Publish 文書より）: 1 開発者アカウントあたり**公開できる拡張機能は最大 20 件**（テーマは別扱い）。ZIP 最大 **2GB**。

## 前提

- Node.js / pnpm（[package.json](../package.json) の `engines`・`packageManager` に準拠）
- Google Chrome（拡張の手動検証用）
- Chrome Web Store 開発者登録済みの Google アカウント（未登録なら上記「開発者登録」から実施）

## 提出前のローカル検証（コマンドは開発者が実行）

リポジトリルートで、次の順に実行してください。

```bash
pnpm check
pnpm test
pnpm e2e
pnpm zip
```

- `pnpm e2e` は [package.json](../package.json) の定義どおり内部で `pnpm build` を実行するため、この列に **単独の `pnpm build` は不要**です。`pnpm zip` も本番向けビルドを行ったうえで ZIP を生成します。
- CI（[.github/workflows/ci.yml](../.github/workflows/ci.yml)）は `check` / `test` / `build` / E2E までです。**ストア提出用 ZIP は CI では生成していません**（必要ならローカルまたは別ジョブで `pnpm zip`）。

## 成果物（ZIP）の場所

`pnpm zip` は本番向けにビルドしたうえで ZIP を生成します。

- **生成ファイル（例）**: `.output/kansu-infinite-scroll-archiver-0.0.0-chrome.zip`
- **命名規則**: `kansu-infinite-scroll-archiver-<package.json の version>-chrome.zip`（`package.json` の `name`・`version` に連動）

アップロードする ZIP 内では **manifest がルート**にある必要があります（[Zip your extension files](https://developer.chrome.com/docs/webstore/prepare)）。WXT が生成する ZIP はこの形式に従います。

ビルド済みの展開先（参照・手動検証用）: `.output/chrome-mv3/`（`.gitignore` 対象のためコミットされません）。

## manifest（提出前に人間が確認すること）

[Prepare your extension](https://developer.chrome.com/docs/webstore/prepare) にあるとおり、アップロード後は **manifest 内のメタデータはダッシュボードから編集できません**。修正する場合は manifest を直し、**version を上げて**から再 ZIP・再アップロードします。

確認項目の例:

- `name` … ストア・ブラウザに表示される名称。現状は `package.json` の `name` が流れ込むため、ユーザー向けには **WXT の manifest 上書きで表示名を整える**ことを検討してください。
- `version` … 初回も更新も、**常に前回より大きい**必要があります。初回は低め（例: `0.0.0.1`）から始めると更新の余地が残りやすいです（[Version](https://developer.chrome.com/docs/extensions/mv3/manifest/version)）。
- `description` … **132 文字以内**（[Description](https://developer.chrome.com/docs/extensions/mv3/manifest/description)）。
- `icons` … 少なくとも 128px など必須サイズを満たすこと。

### 本リポジトリの権限・挙動（審査・Privacy 記載の参考）

- Content Script は `matches: ["<all_urls>"]` で**全 URL に注入**されます（[`src/entrypoints/content/index.ts`](../src/entrypoints/content/index.ts)）。ユーザーが訪問したページの DOM を読み取り、設定に従い抽出します。
- 現時点で **`host_permissions` は付与していません**（任意サイトへの追加のネットワーク権限は要求しない方針。Scratchpad の Phase 6 記載と整合）。
- 抽出データは **IndexedDB にローカル保存**し、要件 **NFR-20**（外部サーバーへ送信しない）に沿った設計です。詳細は [requirements.md の 5.3](requirements.md#53-セキュリティプライバシー) を参照。

## ダッシュボードでの操作順（初回公開）

[Publish in the Chrome Web Store](https://developer.chrome.com/docs/webstore/publish) に従います。

1. [デベロッパー ダッシュボード](https://chrome.google.com/webstore/devconsole) を開く。
2. **Add new item** → 生成した ZIP をアップロード。
3. 左メニューから各タブを埋める:
   - **Package** … アップロード済みパッケージの情報（初回は manifest 由来が表示される）。
   - **Store Listing** … 説明・スクリーンショットなど。[Store listing](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)、[Creating a great listing page](https://developer.chrome.com/docs/webstore/best_listing)
   - **Privacy** … 単一目的・ユーザーデータの扱いの宣言。[Privacy practices](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)
   - **Distribution** … 公開範囲・国など。[Distribution](https://developer.chrome.com/docs/webstore/cws-dashboard-distribution)
   - **Test instructions** … 審査員向け。ログインや再現手順が必要な場合のみ。[Test instructions](https://developer.chrome.com/docs/webstore/cws-dashboard-test-instructions)
4. **Submit for review**。ダイアログで、審査通過後に**すぐ公開するか／手動で公開時期を選ぶか**（Deferred publishing）を指定できます。

審査の目安・プロセス: [Understanding the review process](https://developer.chrome.com/docs/webstore/review-process)

## 更新版の公開

- [Update your Chrome Web Store item](https://developer.chrome.com/docs/webstore/update)
- 新しい ZIP をアップロードし、**manifest の `version` を前回より大きく**する。

## リリースチェックリスト（コピー用）

提出前に次を確認してください。

- [ ] `pnpm check` / `pnpm test` / `pnpm e2e` が通過している
- [ ] `pnpm zip` で ZIP を生成し、パスとファイルサイズを確認した
- [ ] `package.json` の `version`（および必要なら表示用 `name`）が意図どおりか（WXT manifest 設定を含む）
- [ ] `.output/chrome-mv3/manifest.json` で `description` が 132 文字以内か
- [ ] アイコンが揃っているか（ビルド出力 `icon/` を確認）
- [ ] 権限が最小限であることの説明を、ストアの Privacy / 説明文で矛盾なく書けるか（上記「本リポジトリの権限・挙動」を参照）
- [ ] 主要シナリオの手動確認（Options で設定 → 対象 URL で抽出 → メイン UI で検索 → インポート/エクスポート など）
- [ ] スクリーンショット・掲載文案・サポート連絡先・（必要なら）プライバシーポリシー URL が揃っている

## 提出用メタ情報草案（テンプレート）

**オーナーがストア画面に転記・推敲してください。** 英語掲載の場合は別途翻訳が必要です。

| 項目 | 草案 / メモ |
| ---- | ----------- |
| 拡張の短い名前（ストア表示） | TBD（例: Kansu） |
| 短い説明（ストア） | TBD |
| 詳細説明 | TBD |
| カテゴリ | TBD（例: 生産性ツール） |
| 言語 | TBD |
| 公式サイト / サポート URL | 本リポジトリを指す場合は `https://github.com/okathira-dev/kansu-infinite-scroll-archiver`（Issues や README への導線として利用可）。別サイトを公式とする場合はその URL。 |
| 連絡用メール | TBD |
| スクリーンショット（1280×800 または 640×400 推奨など） | [best_listing](https://developer.chrome.com/docs/webstore/best_listing) を参照し枚数・サイズを満たす |
| プライバシーポリシー URL | TBD（公開ページの URL。ホスティングはオーナー判断） |

manifest の `description`（英語のままの可能性あり）とストアの長文説明は**別物**です。ストア側で訴求を補完してください。

## プライバシー方針文のたたき台（技術事実ベース）

以下は **実装・要件に基づく説明用ドラフト**であり、**法的なプライバシーポリシーとしての十分性は保証しません**。公開文書として使う場合はオーナー側で法務・ポリシーを確認してください。

- 本拡張は、ユーザーが指定したウェブページ上の**表示済みの内容**を、ユーザーが定義したルールに基づき読み取り、**ユーザー端末内の IndexedDB に保存**します。
- **収集した情報を開発者のサーバーへ送信したり、第三者と共有したりする行為は行いません**（要件 NFR-20）。
- 設定・抽出・検索・インポート/エクスポートは、原則として**端末内で完結**します。
- コンテンツスクリプトは `matches` に従いページに注入されますが、**追加の `host_permissions` による任意ホストへのネットワークアクセス権限は要求しません**（現行実装）。

Chrome Web Store の **Privacy** タブでは、フォームの設問に正確に答える必要があります。最新の要件は [Privacy practices tab](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy) を参照してください。

## 公式ドキュメント一覧

| 内容 | URL |
| ---- | --- |
| 開発者登録 | <https://developer.chrome.com/docs/webstore/register> |
| アカウント設定 | <https://developer.chrome.com/docs/webstore/set-up-account> |
| 提出前の準備（manifest・ZIP 等） | <https://developer.chrome.com/docs/webstore/prepare> |
| 初回公開フロー | <https://developer.chrome.com/docs/webstore/publish> |
| 更新 | <https://developer.chrome.com/docs/webstore/update> |
| 審査プロセス | <https://developer.chrome.com/docs/webstore/review-process> |
| プログラムポリシー（利用規約） | <https://developer.chrome.com/docs/webstore/program-policies/terms> |
| ベストプラクティス | <https://developer.chrome.com/docs/webstore/best-practices> |
| 掲載ページの作り方 | <https://developer.chrome.com/docs/webstore/best_listing> |
| Store Listing タブ | <https://developer.chrome.com/docs/webstore/cws-dashboard-listing> |
| Privacy タブ | <https://developer.chrome.com/docs/webstore/cws-dashboard-privacy> |
| Distribution タブ | <https://developer.chrome.com/docs/webstore/cws-dashboard-distribution> |
| Test instructions タブ | <https://developer.chrome.com/docs/webstore/cws-dashboard-test-instructions> |
| ローカルでの拡張読み込み（検証） | <https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics#load-unpacked> |
| デベロッパー ダッシュボード | <https://chrome.google.com/webstore/devconsole> |

## リポジトリ内の関連ドキュメント

- 実装計画 Phase 6: [implementation_plan.md](implementation_plan.md) の「3.7. Phase 6」
- 要件（セキュリティ・プライバシー）: [requirements.md](requirements.md) の「5.3. セキュリティ・プライバシー」
