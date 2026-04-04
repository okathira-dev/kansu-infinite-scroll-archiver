import type { ExtractedRecord, ServiceConfig } from "@/lib/types";
import { extractFieldData } from "./fieldExtractor";
import { buildNormalizedSearchText } from "./textNormalization";

export interface ExtractRecordsOptions {
  config: ServiceConfig;
  observeRoot: ParentNode;
  pageUrl: string;
}

const safeQuerySelectorAll = (root: ParentNode, selector: string): Element[] => {
  try {
    return Array.from(root.querySelectorAll(selector));
  } catch {
    return [];
  }
};

/**
 * 監視ルート内のアイテム要素群からレコード配列を抽出する。
 */
export const extractRecordsFromDom = ({
  config,
  observeRoot,
  pageUrl,
}: ExtractRecordsOptions): ExtractedRecord[] => {
  const extractedAt = new Date().toISOString();
  const itemElements = safeQuerySelectorAll(observeRoot, config.itemSelector);

  const records: ExtractedRecord[] = [];
  for (const itemElement of itemElements) {
    const data = extractFieldData(itemElement, config.fields, pageUrl);
    const uniqueKey = (data[config.uniqueKeyField] ?? "").trim();
    if (uniqueKey.length === 0) {
      continue;
    }

    const normalizedSearchText =
      buildNormalizedSearchText(Object.values(data)) || buildNormalizedSearchText([uniqueKey]);

    records.push({
      serviceId: config.id,
      uniqueKey,
      extractedAt,
      data,
      normalizedSearchText,
    });
  }

  return records;
};
