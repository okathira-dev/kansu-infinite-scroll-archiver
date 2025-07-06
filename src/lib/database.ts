/**
 * Kansu: infinite scroll archiver
 * IndexedDBデータベーススキーマ定義
 */

import Dexie, { type EntityTable } from "dexie";
import type {
  CreateExtractedData,
  CreateServiceConfig,
  ExtractedData,
  SearchParams,
  SearchResult,
  ServiceConfig,
} from "./types";

// =============================================================================
// データベースクラス定義
// =============================================================================

/**
 * KansuDatabase
 * アプリケーション全体で使用するIndexedDBデータベース
 */
export class KansuDatabase extends Dexie {
  // サービス設定テーブル
  services!: EntityTable<ServiceConfig, "id">;

  // 抽出データテーブル
  extractedData!: EntityTable<ExtractedData, "id">;

  constructor() {
    super("KansuDB");

    // データベーススキーマの定義
    this.version(1).stores({
      // サービス設定テーブル
      // インデックス: id(主キー), name, urlPattern, enabled, createdAt, updatedAt
      services: "++id, name, urlPattern, enabled, createdAt, updatedAt",

      // 抽出データテーブル
      // インデックス: id(主キー), serviceId, sourceUrl, extractedAt, hash
      // 複合インデックス: [serviceId+extractedAt], [serviceId+hash]
      extractedData:
        "++id, serviceId, sourceUrl, extractedAt, hash, [serviceId+extractedAt], [serviceId+hash]",
    });

    // データベースオープン時のイベントハンドラー
    // テスト環境では、イベントハンドラーの設定をスキップ
    if (typeof process === "undefined" || process.env.NODE_ENV !== "test") {
      try {
        this.on("ready", this.onDatabaseOpen.bind(this));
      } catch (error) {
        console.warn("Database event handler setup failed:", error);
      }
    }
  }

  /**
   * データベースオープン時の処理
   */
  private async onDatabaseOpen(): Promise<void> {
    console.log("KansuDB opened successfully");

    // 初期データの投入や、マイグレーション処理がある場合はここに記述
    await this.initializeDefaultData();
  }

  /**
   * 初期データの投入
   */
  private async initializeDefaultData(): Promise<void> {
    // デフォルトのサービス設定があれば投入
    // 現在は何も投入しない
  }
}

// =============================================================================
// データベースインスタンス
// =============================================================================

let _db: KansuDatabase | null = null;

/**
 * データベースインスタンスを取得（遅延初期化）
 */
export function getDatabase(): KansuDatabase {
  if (!_db) {
    _db = new KansuDatabase();
  }
  return _db;
}

/**
 * データベースインスタンスをリセット（主にテスト用）
 */
export function resetDatabase(): void {
  _db = null;
}

/**
 * グローバルデータベースインスタンス（後方互換性のため）
 */
export const db = getDatabase();

// =============================================================================
// サービス設定操作
// =============================================================================

/**
 * サービス設定の保存
 */
export async function saveServiceConfig(config: CreateServiceConfig): Promise<string> {
  const now = new Date();
  const serviceConfig: Omit<ServiceConfig, "id"> = {
    ...config,
    createdAt: now,
    updatedAt: now,
  };

  const id = await db.services.add(serviceConfig as ServiceConfig);
  return String(id);
}

/**
 * サービス設定の更新
 */
export async function updateServiceConfig(
  id: string,
  updates: Partial<ServiceConfig>,
): Promise<void> {
  const updateData = {
    ...updates,
    updatedAt: new Date(),
  };

  // 文字列IDを数値に変換してから更新
  const numericId = Number(id);
  await db.services.update(numericId, updateData);
}

/**
 * サービス設定の取得（ID指定）
 */
export async function getServiceConfig(id: string): Promise<ServiceConfig | undefined> {
  // 文字列IDを数値に変換してから取得
  const numericId = Number(id);
  return await db.services.get(numericId);
}

/**
 * 全サービス設定の取得
 */
export async function getAllServiceConfigs(): Promise<ServiceConfig[]> {
  return await db.services.orderBy("createdAt").toArray();
}

/**
 * 有効なサービス設定の取得
 */
export async function getEnabledServiceConfigs(): Promise<ServiceConfig[]> {
  // enabledフィールドがtrueのサービス設定を取得
  // Dexieでは、booleanフィールドを直接検索できない場合があるため、
  // 全件取得してからフィルタリングする
  const allServices = await db.services.toArray();
  return allServices.filter((service) => service.enabled === true);
}

/**
 * URLに対応するサービス設定を取得
 */
export async function getServiceConfigByUrl(url: string): Promise<ServiceConfig | undefined> {
  try {
    const services = await getAllServiceConfigs();
    return services.find((service) => {
      try {
        const regex = new RegExp(service.urlPattern);
        return regex.test(url);
      } catch (_error) {
        // TODO: エラーハンドリングの改善 - より詳細なログ出力を検討
        console.warn(`Invalid URL pattern for service ${service.name}:`, service.urlPattern);
        return false;
      }
    });
  } catch (error) {
    console.error("Failed to get service config by URL:", error);
    return undefined;
  }
}

/**
 * サービス設定の削除
 */
export async function deleteServiceConfig(id: string): Promise<void> {
  await db.transaction("rw", [db.services, db.extractedData], async () => {
    // 文字列IDを数値に変換してから削除
    const numericId = Number(id);
    await db.services.delete(numericId);

    // 関連する抽出データも削除（serviceIdは文字列として保存）
    await db.extractedData.where("serviceId").equals(id).delete();
  });
}

// =============================================================================
// 抽出データ操作
// =============================================================================

/**
 * 抽出データの保存
 * 重複チェックも行う
 */
export async function saveExtractedData(data: CreateExtractedData[]): Promise<number> {
  let savedCount = 0;

  await db.transaction("rw", db.extractedData, async () => {
    for (const item of data) {
      const hash = generateDataHash(item);

      // 重複チェック（serviceId + hash の組み合わせで確認）
      const existing = await db.extractedData
        .where("[serviceId+hash]")
        .equals([item.serviceId, hash])
        .first();

      if (!existing) {
        const extractedData: Omit<ExtractedData, "id"> = {
          ...item,
          extractedAt: new Date(),
          hash,
        };

        await db.extractedData.add(extractedData as ExtractedData);
        savedCount++;
      }
    }
  });

  return savedCount;
}

/**
 * データのハッシュ値生成（重複チェック用）
 */
function generateDataHash(data: CreateExtractedData): string {
  // 簡単なハッシュ生成（本格的な実装では crypto API を使用）
  const hashSource = JSON.stringify({
    serviceId: data.serviceId,
    sourceUrl: data.sourceUrl,
    fieldData: data.fieldData,
  });

  // 簡易ハッシュ関数
  let hash = 0;
  for (let i = 0; i < hashSource.length; i++) {
    const char = hashSource.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32bit整数に変換
  }

  return Math.abs(hash).toString(36);
}

/**
 * データ検索
 */
export async function searchExtractedData(params: SearchParams): Promise<SearchResult> {
  try {
    let query = db.extractedData.orderBy("extractedAt");

    // サービスIDフィルタ
    if (params.serviceId) {
      query = query.filter((item) => item.serviceId === params.serviceId);
    }

    // 日付範囲フィルタ
    if (params.dateFrom) {
      query = query.filter((item) => item.extractedAt >= params.dateFrom!);
    }
    if (params.dateTo) {
      query = query.filter((item) => item.extractedAt <= params.dateTo!);
    }

    // 全データを取得
    const allData = await query.toArray();

    // キーワード検索
    let filteredData = allData;
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filteredData = allData.filter((item) => {
        // サービス設定を取得して検索対象フィールドを特定
        const searchableFields = params.searchFields || Object.keys(item.fieldData);
        return searchableFields.some((fieldId) => {
          const value = item.fieldData[fieldId];
          return value?.toString().toLowerCase().includes(keyword);
        });
      });
    }

    // ソート
    if (params.sortField) {
      const sortField = params.sortField;
      const sortOrder = params.sortOrder || "asc";

      filteredData.sort((a, b) => {
        let aValue = a.fieldData[sortField];
        let bValue = b.fieldData[sortField];

        // 日付の場合の特別処理
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortOrder === "asc"
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        // 数値の場合の特別処理
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
          return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
        }

        // 文字列として比較
        aValue = aValue ? aValue.toString().toLowerCase() : "";
        bValue = bValue ? bValue.toString().toLowerCase() : "";

        if (sortOrder === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    }

    // ページネーション
    const pageSize = params.pageSize || 20;
    const page = params.page || 1;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData.map((item) => ({
        ...item,
        // TODO: 型安全性の改善 - fieldDataの型定義を改善する
        // 現在は Record<string, any> だが、より具体的な型を定義することを検討
        fieldData: item.fieldData.length
          ? item.fieldData.reduce(
              (acc, field) => {
                acc[field.id] = field.value;
                return acc;
              },
              {} as Record<string, any>,
            )
          : item.fieldData,
      })),
      totalCount: filteredData.length,
      currentPage: page,
      totalPages: Math.ceil(filteredData.length / pageSize),
      pageSize: pageSize,
    };
  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  }
}

/**
 * 日本語テキストの正規化（表記揺れ対応）
 */
function _normalizeJapaneseText(text: string): string {
  return (
    text
      .toLowerCase()
      // 全角英数字を半角に変換
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
      // 全角スペースを半角に変換
      .replace(/　/g, " ")
      // カタカナをひらがなに変換
      .replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60))
      // 連続するスペースを1つに
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * 抽出データの削除
 */
export async function deleteExtractedData(id: string): Promise<void> {
  await db.extractedData.delete(id);
}

/**
 * サービスの抽出データを全て削除
 */
export async function deleteExtractedDataByService(serviceId: string): Promise<void> {
  await db.extractedData.where("serviceId").equals(serviceId).delete();
}

// =============================================================================
// インポート/エクスポート
// =============================================================================

/**
 * サービスのデータをエクスポート
 */
// TODO: 型安全性の改善 - ExportData 型を使用する
// 現在は Promise<any> だが、適切な ExportData 型を定義して使用するべき
export async function exportServiceData(serviceId: string): Promise<any> {
  const serviceConfig = await getServiceConfig(serviceId);
  if (!serviceConfig) {
    throw new Error(`Service with ID ${serviceId} not found`);
  }

  const extractedData = await db.extractedData.where("serviceId").equals(serviceId).toArray();

  return {
    metadata: {
      exportedAt: new Date(),
      version: "1.0.0",
      serviceId,
    },
    serviceConfig,
    extractedData,
  };
}

/**
 * データのインポート
 */
export async function importServiceData(exportData: any): Promise<void> {
  const { serviceConfig, extractedData } = exportData;

  // サービス設定を保存
  await saveServiceConfig(serviceConfig);

  // 抽出データを保存
  if (extractedData && extractedData.length > 0) {
    await saveExtractedData(extractedData);
  }
}

// =============================================================================
// データベースユーティリティ
// =============================================================================

/**
 * データベースの統計情報を取得
 */
export async function getDatabaseStats(): Promise<{
  serviceCount: number;
  dataCount: number;
  totalSize: number;
}> {
  const serviceCount = await db.services.count();
  const dataCount = await db.extractedData.count();

  // 概算サイズ（実際のストレージサイズではない）
  const totalSize = await db.extractedData.toArray().then((data) => JSON.stringify(data).length);

  return {
    serviceCount,
    dataCount,
    totalSize,
  };
}

/**
 * データベースのクリーンアップ
 */
export async function cleanupDatabase(): Promise<void> {
  await db.transaction("rw", [db.services, db.extractedData], async () => {
    // 無効なサービスに関連するデータを削除
    const enabledServices = await getEnabledServiceConfigs();
    const enabledServiceIds = enabledServices.map((s) => s.id);

    await db.extractedData.where("serviceId").noneOf(enabledServiceIds).delete();
  });
}
