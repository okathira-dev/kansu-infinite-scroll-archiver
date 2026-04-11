/**
 * Kansu のドメイン型定義。
 *
 * Content Script / Background / Popup / Options で共有する。
 * 要件のサービス設定・抽出レコード・検索・I/O 形式に対応する（`docs/requirements.md` の FR 群を参照）。
 */

/** フィールド抽出の種別。 */
export type FieldType = "text" | "linkUrl" | "imageUrl" | "regex";

/** 1 フィールド分の抽出ルール（セレクタと型）。 */
export interface FieldRule {
  /** フィールド識別名。`ServiceConfig.uniqueKeyField` はここに列挙された名前のいずれかである必要がある。 */
  name: string;
  /** CSS セレクタ。 */
  selector: string;
  type: FieldType;
  /** `type === "regex"` のとき必須。正規表現パターン文字列。 */
  regex?: string;
}

/**
 * サイト単位の抽出・監視設定。
 *
 * URL 一致時に有効化され、`MutationObserver` のルートやアイテムの切り出しに使う。
 */
export interface ServiceConfig {
  id: string;
  name: string;
  /** 対象 URL パターン（ワイルドカード等、実装側の一致ロジックに従う）。 */
  urlPatterns: string[];
  /** 監視ルート要素を指すセレクタ。 */
  observeRootSelector: string;
  /** 1 アイテム相当の DOM を指すセレクタ。 */
  itemSelector: string;
  /** 重複判定に使うフィールド名。`fieldRules` 内の `name` と一致すること。 */
  uniqueKeyField: string;
  fieldRules: FieldRule[];
  /** 有効なときのみ抽出パイプラインを動かす（FR-01）。 */
  enabled: boolean;
  /** ISO 8601 など、更新時刻の文字列。 */
  updatedAt: string;
}

/**
 * 抽出フィールド 1 件分の値。
 *
 * `raw` は表示・エクスポート用途の生値、`normalized` は検索高速化のための正規化済み値。
 */
export interface RecordFieldValue {
  raw: string;
  normalized: string;
}

/**
 * IndexedDB に保存する 1 件の抽出結果。
 */
export interface ExtractedRecord {
  serviceId: string;
  uniqueKey: string;
  extractedAt: string;
  /** フィールド名 → 抽出値（生値 + 検索用正規化値）。 */
  fieldValues: Record<string, RecordFieldValue>;
}

/** 一覧のソート方向。 */
export type SortOrder = "asc" | "desc";

/** Background への検索要求。ページング・ソートキーを含む。 */
export interface SearchQuery {
  serviceId: string;
  /** 空文字は「キーワードなし（全件対象）」として扱う実装が可能。 */
  keyword: string;
  /** キーワード検索の対象とするフィールド名一覧。 */
  targetFieldNames: string[];
  /** ソートに使うフィールド名。 */
  sortBy: string;
  sortOrder: SortOrder;
  /** 1 始まりのページ番号。 */
  page: number;
  pageSize: number;
}

/** 検索結果の 1 ページ分と総件数。 */
export interface SearchResult {
  records: ExtractedRecord[];
  total: number;
}

/**
 * サービス単位エクスポート JSON の論理形。
 *
 * `schemaVersion` でインポート時の互換判定に使う（FR-41）。
 */
export interface ExportPayload {
  schemaVersion: number;
  service: ServiceConfig;
  records: ExtractedRecord[];
  meta: {
    exportedAt: string;
  };
}

/** インポート時は `ExportPayload` と同一構造を要求する。 */
export interface ImportPayload extends ExportPayload {}

/**
 * `data/import` 成功時の件数サマリ（`FR-42` の upsert 集計を UI へ伝える）。
 *
 * - `imported`: ペイロード内のレコード件数
 * - `created` / `updated`: 既存キー有無に基づく概算（`RecordRepository.summarizeUpsert`）
 */
export interface ImportResult {
  serviceId: string;
  imported: number;
  created: number;
  updated: number;
}
