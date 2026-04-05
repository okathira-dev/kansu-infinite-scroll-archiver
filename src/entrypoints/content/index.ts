import { createElement } from "react";
import ReactDOM from "react-dom/client";
import { createShadowRootUi } from "wxt/utils/content-script-ui/shadow-root";
import { MainPanel } from "./ui/MainPanel";
import "./ui/style.css";
import { startContentEngine } from "./engine";

const TOGGLE_MAIN_UI_MESSAGE_TYPE = "kansu/toggleMainUi";

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
    await startContentEngine();
    let isMounted = false;

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
    const toggleMainUi = () => {
      if (isMounted) {
        ui.remove();
        isMounted = false;
        return;
      }
      ui.mount();
      isMounted = true;
    };

    const messageListener = (message: unknown) => {
      if (!isToggleMainUiMessage(message)) {
        return undefined;
      }
      toggleMainUi();
      return Promise.resolve({ ok: true, visible: isMounted });
    };

    browser.runtime.onMessage.addListener(messageListener);
    window.addEventListener(
      "pagehide",
      () => {
        browser.runtime.onMessage.removeListener(messageListener);
      },
      { once: true },
    );
  },
});
