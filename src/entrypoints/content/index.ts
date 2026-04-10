import { createElement } from "react";
import ReactDOM from "react-dom/client";
import { createShadowRootUi } from "wxt/utils/content-script-ui/shadow-root";
import { isConfigsUpdatedMessage } from "@/lib/messages/systemEvents";
import { MainPanel } from "./ui/MainPanel";
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

    await startContentEngine();

    const ui = await createShadowRootUi(ctx, {
      name: "kansu-main-ui",
      position: "inline",
      anchor: "body",
      isolateEvents: true,
      onMount: (container) => {
        const reactHost = document.createElement("div");
        const selectPortalHost = document.createElement("div");
        selectPortalHost.setAttribute("data-kansu-select-portal-host", "");
        container.append(reactHost);
        container.append(selectPortalHost);
        const root = ReactDOM.createRoot(reactHost);
        root.render(
          createElement(MainPanel, {
            selectPortalContainer: selectPortalHost,
            onRequestClose: () => {
              ui.remove();
              isMounted = false;
            },
          }),
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
      },
      { once: true },
    );
  },
});
