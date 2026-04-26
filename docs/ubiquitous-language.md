# Kansu ユビキタス言語（コンポーネント／モジュール構成）

実装の細かい規約は [`.cursor/rules/kansu-agent-conventions.mdc`](../.cursor/rules/kansu-agent-conventions.mdc) を正本とする。本書は **用語と境界の辞書**（表形式）に限定する。

## 目的

- `src/components/ui`、`src/entrypoints/**/ui`、`src/entrypoints/**/feature`、`src/lib` の役割を平易な言葉で固定し、誤解を防ぐ。
- Atomic Design や Container/Presentational の語は参照に使ってよいが、Kansu では下表の呼称を優先する。
- `entrypoints/**/ui` の全コンポーネントを機械的に `feature` へ移すのではなく、feature 所有が明確な View のみを移設対象にする。

## 推奨呼称（一覧表）

| 推奨呼称 | 主な置き場所 | 一言定義 | 旧語・注意 | 誤用禁止 |
| --- | --- | --- | --- | --- |
| **共有 UI 基盤（UI プリミティブ）** | `src/components/ui/` | エントリ横断で再利用する見た目・操作の部品 | Atomic Design の atom に近いが、フォルダ名 `atoms/` は作らない | エントリ固有の統合やブラウザ API を置かない |
| **エントリ専用 UI（props 駆動 UI）** | `src/entrypoints/<name>/ui/` | そのエントリ内の共通ブロック。props と子で見た目が決まり副作用なし | Presentational に近いが「hooks 禁止」ではない | runtime / storage / toast / IndexedDB / ファイル I/O を直接扱わない |
| **機能統合（副作用・統合）** | `src/entrypoints/<name>/feature/` または `App` | 購読・ストア・ブラウザ API・非同期・トーストなど純粋でない統合 | Container に近いが「feature 固定」ではない | 分割のための分割をしない |
| **画面ブロック View（`*View`）** | `src/entrypoints/<name>/feature/<ComponentName>/`（所有が明確なとき） | 表示責務の抽出。統合は無標、表示は `*View` | Dumb の別名ではなく表示責務の記号 | 名前だけで副作用を許容しない。非所有の共通 UI を無理に `feature` へ寄せない |
| **境界モジュール（外部 API ラッパー）** | `src/components/` または `src/lib/` | 外部依存をプロジェクト向け公開 API に閉じる | Adapter / Facade に近い。Container ではない | `entrypoints/**` から外部ライブラリを直 import しない |
| **共有ドメイン・契約** | `src/lib/`（`types` / `messages` 等） | 複数エントリで共有する型・メッセージ・ドメインロジック | Shared Kernel に近い | 単一機能専用を無条件に `lib` へ昇格しない |
| **WXT エントリ（起動単位）** | `src/entrypoints/<name>/` | background / content / popup / options の起動境界 | 通常アプリの「画面」とは別（拡張の実行単位） | Content で `content.ts` と `content/index.ts` を併存させない |

## C/P 分離時のファイル命名（補足表）

| ファイル | 役割 |
| --- | --- |
| `ComponentName.tsx` | 統合（副作用・ブラウザ API・ストア等） |
| `ComponentNameView.tsx` | 表示（props 駆動、副作用なし） |
| `index.ts` | 公開 API の再エクスポート専用（バレル） |

単一コンポーネントのみのときは従来どおり `<ComponentName>/index.tsx` を正本としてよい（`kansu-agent-conventions.mdc` の命名節）。

## 補助原則

- C/P（Container/Presentational）は目的ではなく手段。境界は「表示・イベント・副作用・データ取得」の関心事で判断する。
- `feature` と `ui` の切り口は「単体で確かめたい塊」の直感を補助シグナルに使ってよいが、唯一の基準にはしない。
