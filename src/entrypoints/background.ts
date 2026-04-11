import { getKansuDb } from "@/lib/db";
import {
  createManualFixtureServiceConfig,
  manualFixtureServiceId,
} from "@/lib/dev/fixtureServiceConfig";
import { CONFIGS_UPDATED_MESSAGE_TYPE, createErrorResponse, MessageRouter } from "@/lib/messages";
import { RecordRepository, ServiceConfigRepository } from "@/lib/repositories";

const CONFIG_MUTATING_MESSAGE_TYPES = new Set(["configs/save", "configs/delete", "data/import"]);

const getMessageType = (message: unknown): string | null => {
  if (typeof message !== "object" || message === null || !("type" in message)) {
    return null;
  }
  return typeof message.type === "string" ? message.type : null;
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
  const router = new MessageRouter({
    serviceConfigRepository,
    recordRepository: new RecordRepository(db),
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

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const messageType = getMessageType(message);
    const shouldNotifyConfigUpdate =
      messageType !== null && CONFIG_MUTATING_MESSAGE_TYPES.has(messageType);

    void router
      .handleRaw(message)
      .then((response) => {
        sendResponse(response);
        if (response.ok && shouldNotifyConfigUpdate) {
          void notifyConfigsUpdated();
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
