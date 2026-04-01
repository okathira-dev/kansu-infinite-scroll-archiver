import { getKansuDb } from "@/lib/db";
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
  const router = new MessageRouter({
    serviceConfigRepository: new ServiceConfigRepository(db),
    recordRepository: new RecordRepository(db),
  });

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
