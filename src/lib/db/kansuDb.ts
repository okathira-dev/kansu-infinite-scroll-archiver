import Dexie, { type Table } from "dexie";
import type { ExtractedRecord, ServiceConfig } from "@/lib/types";

/** アプリケーション全体で使う追加設定テーブルの行。 */
export interface AppSetting {
  id: string;
  value: unknown;
}

/**
 * Kansu の IndexedDB 定義。
 *
 * 動的ストア追加は行わず、固定テーブル構成でバージョン管理する。
 * 本番実行時はブラウザ組み込みの IndexedDB を利用し、
 * テスト時のみ `Dexie.dependencies` へ `fake-indexeddb` を注入して同じコードパスを検証する。
 */
export class KansuDb extends Dexie {
  serviceConfigs!: Table<ServiceConfig, string>;
  records!: Table<ExtractedRecord, [string, string]>;
  appSettings!: Table<AppSetting, string>;

  constructor(databaseName = "kansu-archive") {
    super(databaseName);
    this.version(1).stores({
      serviceConfigs: "&id, enabled, updatedAt",
      records: "&[serviceId+uniqueKey], serviceId, extractedAt",
      appSettings: "&id",
    });
  }
}

let sharedDb: KansuDb | null = null;

/** Background で再利用する Dexie インスタンスを返す。 */
export const getKansuDb = (): KansuDb => {
  if (!sharedDb) {
    sharedDb = new KansuDb();
  }
  return sharedDb;
};
