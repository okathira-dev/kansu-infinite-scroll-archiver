import type { ExtractedRecord, ImportPayload, SearchQuery, ServiceConfig } from "@/lib/types";
import {
  createErrorResponse,
  createSuccessResponse,
  type RequestMessage,
  type ResponseMessage,
} from "./contracts";
import { parseRequestMessage } from "./parser";

/**
 * サービス内でレコードを一意に指すキー（Phase 2 の複合キー `[serviceId+uniqueKey]` に相当）。
 */
const recordKey = (record: Pick<ExtractedRecord, "serviceId" | "uniqueKey">) =>
  `${record.serviceId}::${record.uniqueKey}`;

/** 日本語の自然順・大文字小文字を抑えた比較（実装ガイド 8.2 に沿う）。 */
const collator = new Intl.Collator("ja", { numeric: true, sensitivity: "base" });

/**
 * メッセージ種別ごとの処理を集約するルータ。
 *
 * @remarks
 * Phase 1 では永続化前の動作確認用に、メモリ上の `Map` で設定・レコードを保持する。
 * Phase 2 で Dexie に差し替えても、このクラスの公開メソッド（`handleRaw`）契約は維持する想定。
 */
export class MessageRouter {
  private serviceConfigs = new Map<string, ServiceConfig>();
  private records = new Map<string, ExtractedRecord>();

  /**
   * 生メッセージを受け取り、パース → ハンドラ実行まで行うエントリ。
   *
   * @returns 常に `ResponseMessage`（検証エラー時も `ok: false`）
   */
  async handleRaw(input: unknown): Promise<ResponseMessage> {
    const parsedMessage = parseRequestMessage(input);
    if (!parsedMessage.ok) {
      return createErrorResponse(
        "VALIDATION_ERROR",
        "request validation failed",
        parsedMessage.errors,
      );
    }

    return this.handle(parsedMessage.data);
  }

  /** パース済みメッセージを種別でディスパッチする。 */
  private async handle(message: RequestMessage): Promise<ResponseMessage> {
    switch (message.type) {
      case "configs/list":
        return createSuccessResponse({
          configs: Array.from(this.serviceConfigs.values()),
        });
      case "configs/save":
        return this.handleConfigSave(message.payload);
      case "records/bulkUpsert":
        return this.handleBulkUpsert(message.payload.records);
      case "records/search":
        return this.handleSearch(message.payload);
      case "data/export":
        return this.handleExport(message.payload.serviceId);
      case "data/import":
        return this.handleImport(message.payload);
      default:
        return createErrorResponse("UNSUPPORTED_MESSAGE", "unsupported message type");
    }
  }

  private async handleConfigSave(config: ServiceConfig): Promise<ResponseMessage> {
    this.serviceConfigs.set(config.id, config);
    return createSuccessResponse({ configId: config.id });
  }

  /**
   * 複数レコードをまとめて upsert。同一 `recordKey` は上書き扱いとし、作成/更新件数を返す。
   */
  private async handleBulkUpsert(records: ExtractedRecord[]): Promise<ResponseMessage> {
    let created = 0;
    let updated = 0;

    for (const record of records) {
      const key = recordKey(record);
      if (this.records.has(key)) {
        updated += 1;
      } else {
        created += 1;
      }
      this.records.set(key, record);
    }

    return createSuccessResponse({
      processed: records.length,
      created,
      updated,
    });
  }

  /**
   * サービス ID で絞り込み → キーワード（部分一致・小文字化）→ ソート → ページスライス。
   *
   * キーワードが空のときはフィルタをスキップし、`sortBy` の欠損キーは空文字同士として比較する。
   */
  private async handleSearch(query: SearchQuery): Promise<ResponseMessage> {
    const records = Array.from(this.records.values()).filter(
      (record) => record.serviceId === query.serviceId,
    );
    const needle = query.keyword.trim().toLowerCase();
    const filtered =
      needle.length === 0
        ? records
        : records.filter((record) => {
            // 事前正規化テキストと、ユーザー指定フィールドのいずれかに部分一致すればヒット
            if (record.normalizedSearchText.toLowerCase().includes(needle)) {
              return true;
            }
            return query.fields.some((field) => record.data[field]?.toLowerCase().includes(needle));
          });

    const sorted = [...filtered].sort((left, right) => {
      const leftValue = left.data[query.sortBy] ?? "";
      const rightValue = right.data[query.sortBy] ?? "";
      const order = collator.compare(leftValue, rightValue);
      return query.sortOrder === "asc" ? order : -order;
    });

    const startIndex = (query.page - 1) * query.pageSize;
    const pageRecords = sorted.slice(startIndex, startIndex + query.pageSize);

    return createSuccessResponse({
      records: pageRecords,
      total: sorted.length,
    });
  }

  private async handleExport(serviceId: string): Promise<ResponseMessage> {
    const service = this.serviceConfigs.get(serviceId);
    if (!service) {
      return createErrorResponse("SERVICE_NOT_FOUND", "service config was not found", {
        serviceId,
      });
    }

    const records = Array.from(this.records.values()).filter(
      (record) => record.serviceId === serviceId,
    );
    return createSuccessResponse({
      schemaVersion: 1,
      service,
      records,
      meta: {
        exportedAt: new Date().toISOString(),
      },
    });
  }

  /** サービス設定とレコードを一括反映。既存キーは上書き（FR-42 の方針に合わせた件数集計）。 */
  private async handleImport(payload: ImportPayload): Promise<ResponseMessage> {
    this.serviceConfigs.set(payload.service.id, payload.service);

    let created = 0;
    let updated = 0;
    for (const record of payload.records) {
      const key = recordKey(record);
      if (this.records.has(key)) {
        updated += 1;
      } else {
        created += 1;
      }
      this.records.set(key, record);
    }

    return createSuccessResponse({
      serviceId: payload.service.id,
      imported: payload.records.length,
      created,
      updated,
    });
  }
}
