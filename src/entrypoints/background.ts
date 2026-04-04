import { getKansuDb } from "@/lib/db";
import {
  createManualFixtureServiceConfig,
  manualFixtureServiceId,
} from "@/lib/dev/fixtureServiceConfig";
import { createErrorResponse, MessageRouter } from "@/lib/messages";
import { RecordRepository, ServiceConfigRepository } from "@/lib/repositories";

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
    void router
      .handleRaw(message)
      .then((response) => sendResponse(response))
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
