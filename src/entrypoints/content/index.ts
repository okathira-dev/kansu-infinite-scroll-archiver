import { createElement } from "react";
import ReactDOM from "react-dom/client";
import { createShadowRootUi } from "wxt/utils/content-script-ui/shadow-root";
import { SelectPortalContainerProvider } from "@/components/ui/select";
import { isConfigsUpdatedMessage } from "@/lib/messages/systemEvents";
import { ArchiveSaveToast } from "./feature/ArchiveSaveToast";
import { MainPanel } from "./feature/MainPanel";
/** Shadow DOM 用のスタイル束。理由・追記方針は `./ui/style.css` 先頭コメント参照。 */
import "./ui/style.css";
import { startContentEngine } from "./engine";

const TOGGLE_MAIN_UI_MESSAGE_TYPE = "kansu/toggleMainUi";
const CONFIGS_UPDATED_EVENT_NAME = "kansu:configs-updated";

const isToggleMainUiMessage = (
  value: unknown,
): value is { type: typeof TOGGLE_MAIN_UI_MESSAGE_TYPE } =>
  typeof value === "object" &&
  value !== null &&
  "type" in value &&
  value.type === TOGGLE_MAIN_UI_MESSAGE_TYPE;

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  async main(ctx) {
    let isMounted = false;
    let pendingToggleCount = 0;
    let toggleMainUi: (() => void) | null = null;

    const messageListener = (message: unknown) => {
      if (isConfigsUpdatedMessage(message)) {
        window.dispatchEvent(new CustomEvent(CONFIGS_UPDATED_EVENT_NAME));
        return Promise.resolve({ ok: true, propagated: true });
      }
      if (!isToggleMainUiMessage(message)) {
        return undefined;
      }
      if (!toggleMainUi) {
        // UI 準備前のトグル要求は取りこぼさず、準備完了後に反映する。
        pendingToggleCount += 1;
        return Promise.resolve({ ok: true, visible: isMounted, pending: true });
      }
      toggleMainUi();
      return Promise.resolve({ ok: true, visible: isMounted });
    };
    browser.runtime.onMessage.addListener(messageListener);

    const notificationUi = await createShadowRootUi(ctx, {
      name: "kansu-notification-ui",
      position: "inline",
      anchor: "body",
      isolateEvents: true,
      onMount: (container) => {
        const reactHost = document.createElement("div");
        container.append(reactHost);
        const root = ReactDOM.createRoot(reactHost);
        root.render(createElement(ArchiveSaveToast));
        return { root };
      },
      onRemove: (mounted) => {
        mounted?.root.unmount();
      },
    });
    notificationUi.mount();

    await startContentEngine();

    const ui = await createShadowRootUi(ctx, {
      name: "kansu-main-ui",
      position: "inline",
      anchor: "body",
      isolateEvents: true,
      onMount: (container) => {
        const reactHost = document.createElement("div");
        container.append(reactHost);
        const root = ReactDOM.createRoot(reactHost);
        root.render(
          createElement(
            SelectPortalContainerProvider,
            { value: container },
            createElement(MainPanel, {
              onRequestClose: () => {
                ui.remove();
                isMounted = false;
              },
            }),
          ),
        );
        return { root };
      },
      onRemove: (mounted) => {
        mounted?.root.unmount();
      },
    });
    toggleMainUi = () => {
      if (isMounted) {
        ui.remove();
        isMounted = false;
        return;
      }
      ui.mount();
      isMounted = true;
    };
    if (pendingToggleCount % 2 === 1) {
      toggleMainUi();
    }
    pendingToggleCount = 0;

    window.addEventListener(
      "pagehide",
      () => {
        browser.runtime.onMessage.removeListener(messageListener);
        notificationUi.remove();
      },
      { once: true },
    );
  },
});
