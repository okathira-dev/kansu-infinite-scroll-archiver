/**
 * Kansu: infinite scroll archiver
 * 基本的なデータ型定義
 */

// =============================================================================
// 基本的な型定義
// =============================================================================

/**
 * フィールドタイプ
 * データ抽出時の値の型を指定
 */
export type FieldType = "text" | "url" | "image" | "number" | "date";

/**
 * ソート順
 */
export type SortOrder = "asc" | "desc";

/**
 * データ抽出ルールのCSSセレクタ設定
 */
export interface ExtractorRule {
  /** CSSセレクタ */
  selector: string;
  /** 属性名（textContentの場合はundefined） */
  attribute?: string;
  /** データの変換ルール（オプション） */
  transform?: "trim" | "lowercase" | "uppercase";
}

// =============================================================================
// フィールド設定
// =============================================================================

/**
 * FIELD: フィールド設定
 * 抽出対象の項目定義
 */
export interface Field {
  /** フィールドの一意識別子 */
  id: string;
  /** フィールド名（表示用） */
  name: string;
  /** フィールドタイプ */
  type: FieldType;
  /** データ抽出ルール */
  extractor: ExtractorRule;
  /** 検索対象かどうか */
  searchable: boolean;
  /** ソート可能かどうか */
  sortable: boolean;
  /** 表示順序 */
  order: number;
  /** 必須フィールドかどうか */
  required: boolean;
}

// =============================================================================
// サービス設定
// =============================================================================

/**
 * SERVICE_CONFIG: サービス設定
 * ウェブサイトごとの抽出設定
 */
export interface ServiceConfig {
  /** サービスの一意識別子 */
  id: string;
  /** サービス名 */
  name: string;
  /** 対象URLパターン（正規表現文字列） */
  urlPattern: string;
  /** フィールド設定のリスト */
  fields: Field[];
  /** 抽出を実行するかどうか */
  enabled: boolean;
  /** 作成日時 */
  createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
  /** 説明（オプション） */
  description?: string;
  /** 無限スクロール検知のセレクタ（オプション） */
  scrollContainer?: string;
}

// =============================================================================
// 抽出データ
// =============================================================================

/**
 * EXTRACTED_DATA: 抽出されたデータ
 * 実際に抽出・保存されるデータ
 */
export interface ExtractedData {
  /** データの一意識別子 */
  id: string;
  /** 抽出元のサービスID */
  serviceId: string;
  /** 抽出元のURL */
  sourceUrl: string;
  /** 抽出されたフィールドデータ（フィールドID => 値のマップ） */
  // TODO: 型安全性の改善 - fieldDataの型を改善する
  // 現在は Record<string, any> だが、フィールドタイプに応じた型を定義することを検討
  fieldData: Record<string, any>;
  /** 抽出日時 */
  extractedAt: Date;
  /** データのハッシュ値（重複防止用） */
  hash: string;
  /** ユーザーメモ（オプション） */
  memo?: string;
}

// =============================================================================
// 検索・フィルタリング
// =============================================================================

/**
 * SEARCH_PARAMS: 検索パラメーター
 * データ検索・フィルタリング用の設定
 */
export interface SearchParams {
  /** 検索キーワード */
  keyword?: string;
  /** 検索対象フィールドIDのリスト（空の場合は全検索対象フィールド） */
  searchFields?: string[];
  /** ソート対象フィールドID */
  sortField?: string;
  /** ソート順 */
  sortOrder?: SortOrder;
  /** ページ番号（1ベース） */
  page?: number;
  /** 1ページあたりの件数 */
  pageSize?: number;
  /** 対象サービスID（フィルタリング用） */
  serviceId?: string;
  /** 日付範囲フィルタ（開始日） */
  dateFrom?: Date;
  /** 日付範囲フィルタ（終了日） */
  dateTo?: Date;
}

/**
 * 検索結果
 */
export interface SearchResult {
  /** 検索結果のデータリスト */
  data: ExtractedData[];
  /** 総件数 */
  totalCount: number;
  /** 現在のページ番号 */
  currentPage: number;
  /** 総ページ数 */
  totalPages: number;
  /** 1ページあたりの件数 */
  pageSize: number;
}

// =============================================================================
// メッセージ通信
// =============================================================================

/**
 * コンポーネント間のメッセージタイプ
 */
export type MessageType =
  | "SAVE_DATA" // データ保存
  | "SEARCH_DATA" // データ検索
  | "GET_SERVICES" // サービス設定取得
  | "GET_SERVICE_BY_URL" // URLに対応するサービス設定取得
  | "SAVE_SERVICE" // サービス設定保存
  | "DELETE_SERVICE" // サービス設定削除
  | "EXPORT_DATA" // データエクスポート
  | "IMPORT_DATA" // データインポート
  | "TOGGLE_UI" // UI表示切り替え
  | "GET_UI_STATE"; // UI状態取得

/**
 * メッセージの基本構造
 */
export interface BaseMessage {
  /** メッセージタイプ */
  type: MessageType;
  /** メッセージID（応答識別用） */
  messageId?: string;
  /** タイムスタンプ */
  timestamp: number;
}

/**
 * データ保存メッセージ
 */
export interface SaveDataMessage extends BaseMessage {
  type: "SAVE_DATA";
  /** 保存するデータ */
  data: ExtractedData[];
}

/**
 * データ検索メッセージ
 */
export interface SearchDataMessage extends BaseMessage {
  type: "SEARCH_DATA";
  /** 検索パラメーター */
  params: SearchParams;
}

/**
 * URLに対応するサービス設定取得メッセージ
 */
export interface GetServiceByUrlMessage extends BaseMessage {
  type: "GET_SERVICE_BY_URL";
  /** 検索対象のURL */
  url: string;
}

/**
 * サービス設定保存メッセージ
 */
export interface SaveServiceMessage extends BaseMessage {
  type: "SAVE_SERVICE";
  /** 保存するサービス設定 */
  service: CreateServiceConfig;
}

/**
 * サービス設定削除メッセージ
 */
export interface DeleteServiceMessage extends BaseMessage {
  type: "DELETE_SERVICE";
  /** 削除するサービスID */
  serviceId: string;
}

/**
 * データエクスポートメッセージ
 */
export interface ExportDataMessage extends BaseMessage {
  type: "EXPORT_DATA";
  /** エクスポート対象のサービスID */
  serviceId: string;
}

/**
 * データインポートメッセージ
 */
export interface ImportDataMessage extends BaseMessage {
  type: "IMPORT_DATA";
  /** インポートするデータ */
  data: ExportData;
}

/**
 * UI表示切り替えメッセージ
 */
export interface ToggleUIMessage extends BaseMessage {
  type: "TOGGLE_UI";
  /** 対象のタブID */
  tabId: number;
  /** 表示するかどうか */
  visible: boolean;
}

/**
 * UI状態取得メッセージ
 */
export interface GetUIStateMessage extends BaseMessage {
  type: "GET_UI_STATE";
}

/**
 * メッセージ応答
 */
// TODO: 型安全性の改善 - ジェネリック型のデフォルトを改善する
// 現在は T = any だが、より具体的なデフォルト型を定義することを検討
export interface MessageResponse<T = any> {
  /** リクエストメッセージID */
  messageId: string;
  /** 成功かどうか */
  success: boolean;
  /** 応答データ */
  data?: T;
  /** エラーメッセージ */
  error?: string;
}

// =============================================================================
// UI状態管理
// =============================================================================

/**
 * メインUIの表示状態
 */
export interface UIState {
  /** UIが表示されているかどうか */
  visible: boolean;
  /** 現在選択されているサービスID */
  selectedServiceId?: string;
  /** 現在の検索パラメーター */
  currentSearch: SearchParams;
  /** ローディング状態 */
  loading: boolean;
}

// =============================================================================
// インポート/エクスポート
// =============================================================================

/**
 * エクスポートデータの構造
 */
export interface ExportData {
  /** エクスポートメタデータ */
  metadata: {
    /** エクスポート日時 */
    exportedAt: Date;
    /** バージョン */
    version: string;
    /** エクスポート対象サービスID */
    serviceId: string;
  };
  /** サービス設定 */
  serviceConfig: ServiceConfig;
  /** 抽出データ */
  extractedData: ExtractedData[];
}

// =============================================================================
// ユーティリティ型
// =============================================================================

/**
 * 作成時に不要なフィールドを除外した型
 */
export type CreateServiceConfig = Omit<ServiceConfig, "id" | "createdAt" | "updatedAt">;
export type CreateExtractedData = Omit<ExtractedData, "id" | "extractedAt" | "hash">;
export type CreateField = Omit<Field, "id">;

/**
 * 更新時用の部分的な型
 */
export type UpdateServiceConfig = Partial<Omit<ServiceConfig, "id" | "createdAt">> & { id: string };
export type UpdateExtractedData = Partial<Omit<ExtractedData, "id" | "extractedAt">> & {
  id: string;
};
