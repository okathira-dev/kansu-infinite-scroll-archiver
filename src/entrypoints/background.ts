import { TabBadgeStateManager } from "@/lib/badge/tabBadgeStateManager";
import { getKansuDb } from "@/lib/db";
import {
  createManualFixtureServiceConfig,
  manualFixtureServiceId,
} from "@/lib/dev/fixtureServiceConfig";
import {
  CONFIGS_UPDATED_MESSAGE_TYPE,
  createErrorResponse,
  isMonitoringStateMessage,
  MessageRouter,
} from "@/lib/messages";
import { RecordRepository, ServiceConfigRepository } from "@/lib/repositories";

const CONFIG_MUTATING_MESSAGE_TYPES = new Set(["configs/save", "configs/delete", "data/import"]);
const BADGE_BACKGROUND_COLOR = "#2563EB";

const getMessageType = (message: unknown): string | null => {
  if (typeof message !== "object" || message === null || !("type" in message)) {
    return null;
  }
  return typeof message.type === "string" ? message.type : null;
};

const getSenderTabId = (sender: unknown): number | null => {
  if (typeof sender !== "object" || sender === null || !("tab" in sender)) {
    return null;
  }
  const tab = sender.tab;
  if (typeof tab !== "object" || tab === null || !("id" in tab)) {
    return null;
  }
  return typeof tab.id === "number" ? tab.id : null;
};

const getBulkUpsertServiceId = (message: unknown): string | null => {
  if (typeof message !== "object" || message === null || !("payload" in message)) {
    return null;
  }
  const payload = message.payload;
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("records" in payload) ||
    !Array.isArray(payload.records) ||
    payload.records.length === 0
  ) {
    return null;
  }
  const firstRecord = payload.records[0];
  if (typeof firstRecord !== "object" || firstRecord === null || !("serviceId" in firstRecord)) {
    return null;
  }
  return typeof firstRecord.serviceId === "string" ? firstRecord.serviceId : null;
};

const getBulkUpsertProcessedCount = (responseData: unknown): number | null => {
  if (
    typeof responseData !== "object" ||
    responseData === null ||
    !("processed" in responseData) ||
    typeof responseData.processed !== "number" ||
    !Number.isFinite(responseData.processed)
  ) {
    return null;
  }
  return responseData.processed;
};

const notifyConfigsUpdated = async (): Promise<void> => {
  try {
    const tabs = await browser.tabs.query({});
    await Promise.all(
      tabs
        .map((tab) => tab.id)
        .filter((id): id is number => typeof id === "number")
        .map(async (tabId) => {
          try {
            await browser.tabs.sendMessage(tabId, {
              type: CONFIGS_UPDATED_MESSAGE_TYPE,
            });
          } catch {
            // Content Script 未注入のタブは想定内のため無視する。
          }
        }),
    );
  } catch (error) {
    console.warn("Kansu: 設定更新通知のブロードキャストに失敗しました", error);
  }
};

/**
 * Service Worker（MV3）のエントリ。
 *
 * すべての `runtime.onMessage` を `MessageRouter` に集約し、非同期 `sendResponse` で応答する。
 * パース/検証エラーはルータ側の `VALIDATION_ERROR`、想定外例外は `INTERNAL_ERROR`。
 */
export default defineBackground(() => {
  const db = getKansuDb();
  const serviceConfigRepository = new ServiceConfigRepository(db);
  const recordRepository = new RecordRepository(db);
  const badgeStateManager = new TabBadgeStateManager();
  const router = new MessageRouter({
    serviceConfigRepository,
    recordRepository,
  });
  const syncTabBadge = async (tabId: number): Promise<void> => {
    const text = badgeStateManager.getBadgeText(tabId);
    await browser.action.setBadgeText({ tabId, text });
    if (text.length > 0) {
      await browser.action.setBadgeBackgroundColor({ tabId, color: BADGE_BACKGROUND_COLOR });
    }
  };

  browser.tabs.onRemoved.addListener((tabId) => {
    badgeStateManager.clear(tabId);
  });
  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status !== "loading") {
      return;
    }
    badgeStateManager.clear(tabId);
    void syncTabBadge(tabId).catch(() => {
      // タブ遷移中のバッジ更新失敗は無視する。
    });
  });

  // 開発デバッグ専用の fixture 設定の自動投入
  // Vite は import.meta.env をビルド時に静的置換し tree-shaking を効かせる（公式: https://vite.dev/guide/env-and-mode.html ）。
  // そのため本番ビルドでは import.meta.env.DEV が偽に置換され、この if ブロック内とそこから辿るモジュールはバンドルから落ちる。
  if (import.meta.env.DEV) {
    void serviceConfigRepository
      .findById(manualFixtureServiceId)
      .then(async (existingConfig) => {
        if (existingConfig) {
          return;
        }
        await serviceConfigRepository.save(createManualFixtureServiceConfig());
      })
      .catch((error: unknown) => {
        console.error("Kansu: fixture 設定の初期投入に失敗しました", error);
      });
  }

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (isMonitoringStateMessage(message)) {
      const senderTabId = getSenderTabId(sender);
      if (senderTabId === null) {
        sendResponse(
          createErrorResponse("BAD_REQUEST", "monitoring state requires sender tab context"),
        );
        return false;
      }

      void (async () => {
        badgeStateManager.setMonitoring(senderTabId, message.payload);
        await syncTabBadge(senderTabId);
        sendResponse({ ok: true, data: { tabId: senderTabId } });
      })().catch((error: unknown) => {
        sendResponse(
          createErrorResponse("INTERNAL_ERROR", "failed to sync monitoring state", {
            reason: error instanceof Error ? error.message : "unknown",
          }),
        );
      });
      return true;
    }

    const messageType = getMessageType(message);
    const shouldNotifyConfigUpdate =
      messageType !== null && CONFIG_MUTATING_MESSAGE_TYPES.has(messageType);
    const senderTabId = getSenderTabId(sender);

    void router
      .handleRaw(message)
      .then(async (response) => {
        sendResponse(response);
        if (response.ok && shouldNotifyConfigUpdate) {
          void notifyConfigsUpdated();
        }
        if (
          response.ok &&
          messageType === "records/bulkUpsert" &&
          senderTabId !== null &&
          response.data
        ) {
          const processed = getBulkUpsertProcessedCount(response.data);
          const serviceId = getBulkUpsertServiceId(message);
          if (processed && serviceId) {
            const config = await serviceConfigRepository.findById(serviceId);
            const total = await recordRepository.countByServiceId(serviceId);
            badgeStateManager.setStoredRecordTotal(senderTabId, {
              serviceId,
              total,
              notificationSettings: config?.notificationSettings,
            });
            await syncTabBadge(senderTabId);
          }
        }
      })
      .catch((error: unknown) => {
        sendResponse(
          createErrorResponse("INTERNAL_ERROR", "unexpected runtime error", {
            reason: error instanceof Error ? error.message : "unknown",
          }),
        );
      });

    // 非同期レスポンスを返すため true を返す。
    return true;
  });
});
