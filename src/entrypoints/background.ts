import { createErrorResponse, MessageRouter } from "@/lib/messages";

/**
 * Service Worker（MV3）のエントリ。
 *
 * すべての `runtime.onMessage` を `MessageRouter` に集約し、非同期 `sendResponse` で応答する。
 * パース/検証エラーはルータ側の `VALIDATION_ERROR`、想定外例外は `INTERNAL_ERROR`。
 */
export default defineBackground(() => {
  const router = new MessageRouter();

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
