import { recordDevPerformanceMetric } from "@/lib/dev/performanceMetrics";
import type { ResponseMessage } from "@/lib/messages";
import {
  MONITORING_STATE_MESSAGE_TYPE,
  SAVE_SUMMARY_EVENT_NAME,
  type SaveSummaryEventDetail,
} from "@/lib/messages/systemEvents";
import {
  type ExtractedRecord,
  resolveServiceNotificationSettings,
  type ServiceConfig,
} from "@/lib/types";
import { MutationBatchProcessor } from "./mutationBatchProcessor";
import { extractRecordsFromDom } from "./recordExtractor";
import { matchesAnyUrlPattern } from "./urlPatternMatcher";

const BATCH_DELAY_MS = 200;

const isSuccessResponse = (value: unknown): value is { ok: true; data: unknown } =>
  typeof value === "object" && value !== null && "ok" in value && value.ok === true;

interface BulkUpsertSummary {
  processed: number;
  created: number;
  updated: number;
}

const toServiceConfigs = (value: unknown): ServiceConfig[] | null => {
  if (typeof value !== "object" || value === null || !("configs" in value)) {
    return null;
  }

  const { configs } = value as { configs: unknown };
  return Array.isArray(configs) ? (configs as ServiceConfig[]) : null;
};

const toBulkUpsertSummary = (value: unknown): BulkUpsertSummary | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const { processed, created, updated } = value as Record<string, unknown>;
  if (
    typeof processed !== "number" ||
    typeof created !== "number" ||
    typeof updated !== "number" ||
    !Number.isFinite(processed) ||
    !Number.isFinite(created) ||
    !Number.isFinite(updated)
  ) {
    return null;
  }
  return { processed, created, updated };
};

const resolveObserveRoot = (selector: string): Element | null => {
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
};

const fetchMatchedServiceConfig = async (currentUrl: string): Promise<ServiceConfig | null> => {
  let response: ResponseMessage<{ configs: ServiceConfig[] }> | undefined;
  try {
    response = await browser.runtime.sendMessage({
      type: "configs/list",
    });
  } catch (error) {
    console.error("Kansu: 設定一覧の取得に失敗しました", error);
    return null;
  }

  if (!isSuccessResponse(response)) {
    console.warn("Kansu: 設定一覧の取得が失敗応答でした", response);
    return null;
  }

  const configs = toServiceConfigs(response.data);
  if (!configs) {
    console.warn("Kansu: 設定一覧の応答形式が不正です", response.data);
    return null;
  }

  return (
    configs.find(
      (config) => config.enabled && matchesAnyUrlPattern(config.urlPatterns, currentUrl),
    ) ?? null
  );
};

const fetchRecordCountByServiceId = async (serviceId: string): Promise<number> => {
  try {
    const response = await browser.runtime.sendMessage({
      type: "records/countByServiceId",
      payload: { serviceId },
    });
    if (!isSuccessResponse(response)) {
      console.warn("Kansu: 保存件数の取得が失敗応答でした", response);
      return 0;
    }
    const data = response.data as { count?: unknown };
    if (typeof data.count !== "number" || !Number.isFinite(data.count)) {
      console.warn("Kansu: 保存件数の応答形式が不正です", response.data);
      return 0;
    }
    return Math.max(0, Math.floor(data.count));
  } catch (error) {
    console.error("Kansu: 保存件数の取得に失敗しました", error);
    return 0;
  }
};

const sendBulkUpsert = async (records: ExtractedRecord[]): Promise<BulkUpsertSummary | null> => {
  try {
    const response = await browser.runtime.sendMessage({
      type: "records/bulkUpsert",
      payload: { records },
    });
    if (!isSuccessResponse(response)) {
      console.warn("Kansu: 一括保存リクエストが失敗しました", response);
      return null;
    }
    const summary = toBulkUpsertSummary(response.data);
    if (!summary) {
      console.warn("Kansu: 一括保存の応答形式が不正です", response.data);
      return null;
    }
    return summary;
  } catch (error) {
    console.error("Kansu: 一括保存の送信に失敗しました", error);
    return null;
  }
};

/** Content Script の抽出エンジンを起動する。 */
export const startContentEngine = async (): Promise<void> => {
  const currentUrl = window.location.href;
  const config = await fetchMatchedServiceConfig(currentUrl);
  if (!config) {
    return;
  }

  const observeRoot = resolveObserveRoot(config.observeRootSelector);
  if (!observeRoot) {
    console.warn("Kansu: 監視ルートが見つかりません", {
      selector: config.observeRootSelector,
      serviceId: config.id,
    });
    return;
  }

  const notificationSettings = resolveServiceNotificationSettings(config.notificationSettings);
  const persistedRecordCount = await fetchRecordCountByServiceId(config.id);
  const notifyMonitoringState = async (active: boolean, persistedCount = 0): Promise<void> => {
    try {
      await browser.runtime.sendMessage({
        type: MONITORING_STATE_MESSAGE_TYPE,
        payload: {
          active,
          serviceId: config.id,
          notificationSettings,
          ...(active ? { persistedRecordCount: persistedCount } : {}),
        },
      });
    } catch (error) {
      console.warn("Kansu: 監視状態通知の送信に失敗しました", error);
    }
  };

  await notifyMonitoringState(true, persistedRecordCount);

  const flushExtraction = async () => {
    const extractionStartAt = performance.now();
    const records = extractRecordsFromDom({ config, observeRoot, pageUrl: currentUrl });
    const extractedAt = performance.now();
    if (records.length === 0) {
      recordDevPerformanceMetric("content-extraction", extractedAt - extractionStartAt, {
        serviceId: config.id,
        records: 0,
        upsertDurationMs: 0,
      });
      return;
    }
    const summary = await sendBulkUpsert(records);
    if (summary) {
      const totalSaved = await fetchRecordCountByServiceId(config.id);
      const detail: SaveSummaryEventDetail = {
        serviceId: config.id,
        processed: summary.processed,
        created: summary.created,
        updated: summary.updated,
        totalSaved,
        notificationSettings,
      };
      window.dispatchEvent(
        new CustomEvent<SaveSummaryEventDetail>(SAVE_SUMMARY_EVENT_NAME, { detail }),
      );
    }
    const flushFinishedAt = performance.now();
    recordDevPerformanceMetric("content-extraction", flushFinishedAt - extractionStartAt, {
      serviceId: config.id,
      records: records.length,
      extractDurationMs: extractedAt - extractionStartAt,
      upsertDurationMs: flushFinishedAt - extractedAt,
    });
  };

  await flushExtraction();

  const batchProcessor = new MutationBatchProcessor({
    delayMs: BATCH_DELAY_MS,
    onFlush: flushExtraction,
  });
  const observer = new MutationObserver(() => {
    batchProcessor.notify();
  });

  observer.observe(observeRoot, { childList: true, subtree: true });

  const cleanup = () => {
    observer.disconnect();
    batchProcessor.stop();
    void notifyMonitoringState(false);
    window.removeEventListener("pagehide", cleanup);
  };
  window.addEventListener("pagehide", cleanup, { once: true });
};
