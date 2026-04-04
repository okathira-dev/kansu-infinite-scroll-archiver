import type { ResponseMessage } from "@/lib/messages";
import type { ExtractedRecord, ServiceConfig } from "@/lib/types";
import { MutationBatchProcessor } from "./mutationBatchProcessor";
import { extractRecordsFromDom } from "./recordExtractor";
import { matchesAnyUrlPattern } from "./urlPatternMatcher";

const BATCH_DELAY_MS = 200;

const isSuccessResponse = (value: unknown): value is { ok: true; data: unknown } =>
  typeof value === "object" && value !== null && "ok" in value && value.ok === true;

const toServiceConfigs = (value: unknown): ServiceConfig[] | null => {
  if (typeof value !== "object" || value === null || !("configs" in value)) {
    return null;
  }

  const { configs } = value as { configs: unknown };
  return Array.isArray(configs) ? (configs as ServiceConfig[]) : null;
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

const sendBulkUpsert = async (records: ExtractedRecord[]): Promise<void> => {
  try {
    const response = await browser.runtime.sendMessage({
      type: "records/bulkUpsert",
      payload: { records },
    });
    if (!isSuccessResponse(response)) {
      console.warn("Kansu: 一括保存リクエストが失敗しました", response);
    }
  } catch (error) {
    console.error("Kansu: 一括保存の送信に失敗しました", error);
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

  const flushExtraction = async () => {
    const records = extractRecordsFromDom({ config, observeRoot, pageUrl: currentUrl });
    if (records.length === 0) {
      return;
    }
    await sendBulkUpsert(records);
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
    window.removeEventListener("pagehide", cleanup);
  };
  window.addEventListener("pagehide", cleanup, { once: true });
};
