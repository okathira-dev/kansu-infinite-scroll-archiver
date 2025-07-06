/**
 * UI Injector Tests
 * UI注入システムのunitテスト
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { UIInjector } from "./ui-injector";

describe("UIInjector", () => {
  let injector: UIInjector;

  beforeEach(() => {
    injector = new UIInjector();
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  describe("UI Container Management", () => {
    it("should create UI container when showing UI", async () => {
      await injector.show();

      const container = document.querySelector("#kansu-ui-container");
      expect(container).toBeTruthy();
      expect(container?.getAttribute("style")).toContain("display: block");
    });

    it("should reuse existing container", async () => {
      await injector.show();
      const firstContainer = document.querySelector("#kansu-ui-container");

      await injector.hide();
      await injector.show();
      const secondContainer = document.querySelector("#kansu-ui-container");

      expect(firstContainer).toBe(secondContainer);
    });

    it("should hide UI container", async () => {
      await injector.show();
      await injector.hide();

      const container = document.querySelector("#kansu-ui-container") as HTMLElement;
      expect(container?.style.display).toBe("none");
    });

    it("should handle show/hide multiple times", async () => {
      // 複数回の表示/非表示操作
      await injector.show();
      await injector.hide();
      await injector.show();
      await injector.hide();

      const container = document.querySelector("#kansu-ui-container") as HTMLElement;
      expect(container).toBeTruthy();
      expect(container?.style.display).toBe("none");
    });

    it("should track visibility state", async () => {
      expect(injector.isUIVisible()).toBe(false);

      await injector.show();
      expect(injector.isUIVisible()).toBe(true);

      await injector.hide();
      expect(injector.isUIVisible()).toBe(false);
    });
  });

  describe("UI Content Management", () => {
    beforeEach(async () => {
      await injector.show();
    });

    it("should update content with string", async () => {
      const testContent = "<div>Test Content</div>";
      await injector.updateContent(testContent);

      const contentElement = document.querySelector("#kansu-content");
      expect(contentElement?.innerHTML).toContain("Test Content");
    });

    it("should update content with HTMLElement", async () => {
      const testElement = document.createElement("div");
      testElement.textContent = "Element Content";
      testElement.className = "test-element";

      await injector.updateContent(testElement);

      const contentElement = document.querySelector("#kansu-content");
      const testChild = contentElement?.querySelector(".test-element");
      expect(testChild?.textContent).toBe("Element Content");
    });

    it("should handle HTML content", async () => {
      const htmlContent = `
        <div class="test-component">
          <h1>Title</h1>
          <p>Description</p>
        </div>
      `;

      await injector.updateContent(htmlContent);

      const contentElement = document.querySelector("#kansu-content");
      const testComponent = contentElement?.querySelector(".test-component");
      expect(testComponent).toBeTruthy();
      expect(testComponent?.querySelector("h1")?.textContent).toBe("Title");
    });

    it("should create container if not exists when updating content", async () => {
      const newInjector = new UIInjector();
      await newInjector.updateContent("<div>Auto-created</div>");

      const container = document.querySelector("#kansu-ui-container");
      expect(container).toBeTruthy();
    });
  });

  describe("UI Structure", () => {
    it("should create proper UI structure", async () => {
      await injector.show();

      const container = document.querySelector("#kansu-ui-container");
      const title = container?.querySelector("h3");
      const closeBtn = container?.querySelector("#kansu-close-btn");
      const content = container?.querySelector("#kansu-content");

      expect(title?.textContent).toBe("Kansu Data Viewer");
      expect(closeBtn).toBeTruthy();
      expect(content).toBeTruthy();
    });

    it("should handle close button click", async () => {
      await injector.show();

      const closeButton = document.querySelector("#kansu-close-btn") as HTMLElement;
      expect(closeButton).toBeTruthy();

      // クローズボタンをクリック
      closeButton.click();

      // UIが非表示になることを確認
      expect(injector.isUIVisible()).toBe(false);
      const container = document.querySelector("#kansu-ui-container") as HTMLElement;
      expect(container?.style.display).toBe("none");
    });
  });

  describe("Styling and Positioning", () => {
    it("should apply proper styling to container", async () => {
      await injector.show();

      const container = document.querySelector("#kansu-ui-container") as HTMLElement;
      const style = container.style;

      // 基本的なポジショニングスタイルを確認
      expect(style.position).toBe("fixed");
      expect(style.zIndex).toBe("10000");
      expect(style.top).toBe("20px");
      expect(style.right).toBe("20px");
      expect(style.width).toBe("400px");
    });

    it("should not interfere with page styles", async () => {
      // ページにスタイルを追加
      document.head.innerHTML = `
        <style>
          body { background: red; }
          .page-content { color: blue; }
        </style>
      `;

      document.body.innerHTML = `<div class="page-content">Page Content</div>`;

      await injector.show();

      // ページのスタイルが影響を受けていないことを確認
      const pageContent = document.querySelector(".page-content") as HTMLElement;
      expect(pageContent.style.color).toBe("");
    });
  });

  describe("Cleanup and Destruction", () => {
    it("should destroy UI container", async () => {
      await injector.show();

      const container = document.querySelector("#kansu-ui-container");
      expect(container).toBeTruthy();

      await injector.destroy();

      const destroyedContainer = document.querySelector("#kansu-ui-container");
      expect(destroyedContainer).toBeFalsy();
      expect(injector.isUIVisible()).toBe(false);
    });

    it("should handle destroy when UI is not created", async () => {
      // UIを作成せずに削除を試行
      await expect(injector.destroy()).resolves.not.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle show() errors gracefully", async () => {
      // DOM操作でエラーが発生する状況をシミュレート
      const originalAppendChild = document.body.appendChild;
      document.body.appendChild = vi.fn().mockImplementation(() => {
        throw new Error("DOM Error");
      });

      // エラーが発生してもクラッシュしないことを確認
      await expect(injector.show()).resolves.not.toThrow();

      // 元の関数を復元
      document.body.appendChild = originalAppendChild;
    });

    it("should handle updateContent with invalid content", async () => {
      await injector.show();

      // 空文字列、null、undefinedコンテンツ
      await injector.updateContent("");
      await injector.updateContent(null as any);
      await injector.updateContent(undefined as any);

      const container = document.querySelector("#kansu-ui-container");
      expect(container).toBeTruthy();
    });

    it("should handle hide() when UI is not shown", async () => {
      // UIを表示せずに非表示にしようとする
      await expect(injector.hide()).resolves.not.toThrow();
    });
  });
});
