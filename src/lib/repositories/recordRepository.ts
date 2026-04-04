import type { KansuDb } from "@/lib/db";
import { normalizeForSearch } from "@/lib/search/textNormalization";
import type { ExtractedRecord, ImportPayload, SearchQuery, SearchResult } from "@/lib/types";

/** bulk upsert 実行結果。 */
export interface BulkUpsertResult {
  processed: number;
  created: number;
  updated: number;
}

/** import 実行結果。 */
export interface ImportResult {
  serviceId: string;
  imported: number;
  created: number;
  updated: number;
}

const collator = new Intl.Collator("ja", { numeric: true, sensitivity: "base" });

const recordKey = (record: Pick<ExtractedRecord, "serviceId" | "uniqueKey">) =>
  `${record.serviceId}::${record.uniqueKey}`;

/** レコード保存・検索に関する永続化アクセスをまとめる。 */
export class RecordRepository {
  constructor(private readonly db: KansuDb) {}

  async bulkUpsert(records: ExtractedRecord[]): Promise<BulkUpsertResult> {
    const summary = await this.db.transaction("rw", this.db.records, async () => {
      const { created, updated } = await this.summarizeUpsert(records);
      await this.db.records.bulkPut(records);
      return { created, updated };
    });

    return {
      processed: records.length,
      created: summary.created,
      updated: summary.updated,
    };
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    const candidates = await this.db.records.where("serviceId").equals(query.serviceId).toArray();
    const needle = normalizeForSearch(query.keyword);
    const filtered =
      needle.length === 0
        ? candidates
        : candidates.filter((record) =>
            query.targetFieldNames.some((fieldName) =>
              record.fieldValues[fieldName]?.normalized.includes(needle),
            ),
          );

    const sorted = [...filtered].sort((left, right) => {
      const leftValue = left.fieldValues[query.sortBy]?.raw ?? "";
      const rightValue = right.fieldValues[query.sortBy]?.raw ?? "";
      const order = collator.compare(leftValue, rightValue);
      return query.sortOrder === "asc" ? order : -order;
    });

    const startIndex = (query.page - 1) * query.pageSize;
    return {
      records: sorted.slice(startIndex, startIndex + query.pageSize),
      total: sorted.length,
    };
  }

  async listByServiceId(serviceId: string): Promise<ExtractedRecord[]> {
    return this.db.records.where("serviceId").equals(serviceId).toArray();
  }

  async importPayload(payload: ImportPayload): Promise<ImportResult> {
    const summary = await this.db.transaction(
      "rw",
      this.db.serviceConfigs,
      this.db.records,
      async () => {
        await this.db.serviceConfigs.put(payload.service);
        const { created, updated } = await this.summarizeUpsert(payload.records);
        await this.db.records.bulkPut(payload.records);
        return { created, updated };
      },
    );

    return {
      serviceId: payload.service.id,
      imported: payload.records.length,
      created: summary.created,
      updated: summary.updated,
    };
  }

  private async summarizeUpsert(
    records: ExtractedRecord[],
  ): Promise<{ created: number; updated: number }> {
    const keys = records.map((record) => [record.serviceId, record.uniqueKey] as [string, string]);
    const existing = await this.db.records.bulkGet(keys);
    const existingKeys = new Set<string>();
    for (const [index, value] of existing.entries()) {
      if (value) {
        const [serviceId, uniqueKey] = keys[index];
        existingKeys.add(`${serviceId}::${uniqueKey}`);
      }
    }

    let created = 0;
    let updated = 0;
    const seenKeys = new Set<string>();
    for (const record of records) {
      const key = recordKey(record);
      if (existingKeys.has(key) || seenKeys.has(key)) {
        updated += 1;
      } else {
        created += 1;
      }
      seenKeys.add(key);
    }

    return { created, updated };
  }
}
