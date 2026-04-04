import { getKansuDb } from "@/lib/db";
import { RecordRepository, ServiceConfigRepository } from "@/lib/repositories";
import type { ImportPayload, ServiceConfig } from "@/lib/types";
import {
  createErrorResponse,
  createSuccessResponse,
  type RequestMessage,
  type ResponseMessage,
} from "./contracts";
import { parseRequestMessage } from "./parser";

/**
 * MessageRouter の依存注入オプション。
 */
export interface MessageRouterDependencies {
  serviceConfigRepository?: ServiceConfigRepository;
  recordRepository?: RecordRepository;
}

/**
 * メッセージ種別ごとの処理を集約するルータ。
 *
 * `handleRaw` の契約を固定し、内部で Dexie Repository を呼び出す。
 */
export class MessageRouter {
  private readonly serviceConfigRepository: ServiceConfigRepository;
  private readonly recordRepository: RecordRepository;

  constructor(dependencies: MessageRouterDependencies = {}) {
    const sharedDb = getKansuDb();
    this.serviceConfigRepository =
      dependencies.serviceConfigRepository ?? new ServiceConfigRepository(sharedDb);
    this.recordRepository = dependencies.recordRepository ?? new RecordRepository(sharedDb);
  }

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
          configs: await this.serviceConfigRepository.list(),
        });
      case "configs/save":
        return this.handleConfigSave(message.payload);
      case "configs/delete":
        return this.handleConfigDelete(message.payload);
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
    const configId = await this.serviceConfigRepository.save(config);
    return createSuccessResponse({ configId });
  }

  private async handleConfigDelete(payload: {
    id: string;
    deleteRecords?: boolean;
  }): Promise<ResponseMessage> {
    const deleted = await this.serviceConfigRepository.delete(payload.id);
    if (!deleted) {
      return createErrorResponse("SERVICE_NOT_FOUND", "service config was not found", {
        serviceId: payload.id,
      });
    }

    const deletedRecords = payload.deleteRecords
      ? await this.recordRepository.deleteByServiceId(payload.id)
      : 0;
    return createSuccessResponse({ configId: payload.id, deletedRecords });
  }

  private async handleBulkUpsert(records: ImportPayload["records"]): Promise<ResponseMessage> {
    const result = await this.recordRepository.bulkUpsert(records);
    return createSuccessResponse(result);
  }

  private async handleSearch(
    query: Extract<RequestMessage, { type: "records/search" }>["payload"],
  ): Promise<ResponseMessage> {
    const result = await this.recordRepository.search(query);
    return createSuccessResponse(result);
  }

  private async handleExport(serviceId: string): Promise<ResponseMessage> {
    const service = await this.serviceConfigRepository.findById(serviceId);
    if (!service) {
      return createErrorResponse("SERVICE_NOT_FOUND", "service config was not found", {
        serviceId,
      });
    }

    const records = await this.recordRepository.listByServiceId(serviceId);
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
    const result = await this.recordRepository.importPayload(payload);
    return createSuccessResponse(result);
  }
}
