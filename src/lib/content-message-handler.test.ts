/**
 * Content Message Handler Tests
 * Content Scriptのメッセージハンドラーのunitテスト
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContentMessageHandler } from "./content-message-handler";
import type { MessageResponse } from "./types";

// WXTのfakeBrowserを使用
const fakeBrowser = (global as any).browser || (global as any).chrome;

describe("ContentMessageHandler", () => {
  let handler: ContentMessageHandler;

  beforeEach(() => {
    // fakeBrowserの初期化
    (globalThis as any).fakeBrowser = {
      runtime: {
        sendMessage: vi.fn(),
        onMessage: {
          addListener: vi.fn(),
          removeListener: vi.fn(),
        },
      },
    };

    handler = new ContentMessageHandler();
    vi.clearAllMocks();
  });

  describe("Message Sending", () => {
    it("should send message to background and return response", async () => {
      const mockResponse: MessageResponse = {
        messageId: "test-message-id",
        success: true,
        data: { result: "success" },
      };

      // browser.runtime.sendMessageをモック
      (globalThis as any).fakeBrowser.runtime.sendMessage = vi.fn().mockResolvedValue(mockResponse);

      const testMessage = {
        type: "SAVE_DATA" as const,
        data: [],
        timestamp: Date.now(),
      };

      const response = await handler.sendToBackground(testMessage);

      expect(response).toEqual(mockResponse);
      expect((globalThis as any).fakeBrowser.runtime.sendMessage).toHaveBeenCalledWith(testMessage);
    });

    it("should handle message sending errors", async () => {
      const error = new Error("Connection failed");
      (globalThis as any).fakeBrowser.runtime.sendMessage = vi.fn().mockRejectedValue(error);

      const testMessage = {
        type: "GET_SERVICES" as const,
        timestamp: Date.now(),
      };

      await expect(handler.sendToBackground(testMessage)).rejects.toThrow("Connection failed");
    });

    it("should handle browser API unavailable", async () => {
      (globalThis as any).fakeBrowser = undefined;

      const testMessage = {
        type: "SAVE_DATA" as const,
        data: [],
        timestamp: Date.now(),
      };

      await expect(handler.sendToBackground(testMessage)).rejects.toThrow(
        "Browser API not available",
      );
    });
  });

  describe("Message Receiving", () => {
    it("should register message listener", () => {
      const mockCallback = vi.fn();

      handler.onMessage(mockCallback);

      expect((globalThis as any).fakeBrowser.runtime.onMessage.addListener).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it("should handle incoming messages", () => {
      const mockCallback = vi.fn();
      let messageListener: any;

      (globalThis as any).fakeBrowser.runtime.onMessage.addListener = vi.fn((listener) => {
        messageListener = listener;
      });

      handler.onMessage(mockCallback);

      const testMessage = {
        type: "TOGGLE_UI_VISIBILITY",
        visible: true,
      };

      const mockSender = {};
      const mockSendResponse = vi.fn();

      // リスナーを直接呼び出し
      messageListener(testMessage, mockSender, mockSendResponse);

      expect(mockCallback).toHaveBeenCalledWith(testMessage);
    });

    it("should handle multiple message listeners", () => {
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();
      let messageListener: any;

      (globalThis as any).fakeBrowser.runtime.onMessage.addListener = vi.fn((listener) => {
        messageListener = listener;
      });

      handler.onMessage(mockCallback1);
      handler.onMessage(mockCallback2);

      const testMessage = {
        type: "UPDATE_SERVICE_CONFIG",
        config: { id: "test", name: "Test Service" },
      };

      messageListener(testMessage, {}, vi.fn());

      expect(mockCallback1).toHaveBeenCalledWith(testMessage);
      expect(mockCallback2).toHaveBeenCalledWith(testMessage);
    });

    it("should handle message listener errors", () => {
      const mockCallback = vi.fn().mockImplementation(() => {
        throw new Error("Callback error");
      });

      let messageListener: any;

      (globalThis as any).fakeBrowser.runtime.onMessage.addListener = vi.fn((listener) => {
        messageListener = listener;
      });

      handler.onMessage(mockCallback);

      const testMessage = {
        type: "TOGGLE_UI_VISIBILITY",
        visible: true,
      };

      // エラーが発生してもクラッシュしないことを確認
      expect(() => {
        messageListener(testMessage, {}, vi.fn());
      }).not.toThrow();
    });
  });

  describe("Message Listener Management", () => {
    it("should remove message listeners", () => {
      const mockCallback = vi.fn();

      handler.onMessage(mockCallback);
      handler.removeMessageListener(mockCallback);

      // 内部のリスナー配列から削除されることを確認
      // 実際の削除は内部実装なので、メッセージが届かないことで確認
      let messageListener: any;

      (globalThis as any).fakeBrowser.runtime.onMessage.addListener = vi.fn((listener) => {
        messageListener = listener;
      });

      // 新しいハンドラーを作成してテスト
      const newHandler = new ContentMessageHandler();
      newHandler.onMessage(mockCallback);
      newHandler.removeMessageListener(mockCallback);

      // メッセージを送信してもコールバックが呼ばれないことを確認
      if (messageListener) {
        messageListener({ type: "TEST" }, {}, vi.fn());
        expect(mockCallback).not.toHaveBeenCalled();
      }
    });
  });

  describe("Message Types", () => {
    beforeEach(() => {
      (globalThis as any).fakeBrowser.runtime.sendMessage = vi.fn().mockResolvedValue({
        messageId: "test-id",
        success: true,
      });
    });

    it("should handle SAVE_DATA message", async () => {
      const message = {
        type: "SAVE_DATA" as const,
        data: [
          {
            serviceId: "test-service",
            sourceUrl: "https://example.com",
            fieldData: { title: "Test Title" },
          },
        ],
        timestamp: Date.now(),
      };

      await handler.sendToBackground(message);

      expect((globalThis as any).fakeBrowser.runtime.sendMessage).toHaveBeenCalledWith(message);
    });

    it("should handle SEARCH_DATA message", async () => {
      const message = {
        type: "SEARCH_DATA" as const,
        params: {
          keyword: "test",
          serviceId: "test-service",
          page: 1,
          pageSize: 20,
        },
        timestamp: Date.now(),
      };

      await handler.sendToBackground(message);

      expect((globalThis as any).fakeBrowser.runtime.sendMessage).toHaveBeenCalledWith(message);
    });

    it("should handle GET_SERVICES message", async () => {
      const message = {
        type: "GET_SERVICES" as const,
        timestamp: Date.now(),
      };

      await handler.sendToBackground(message);

      expect((globalThis as any).fakeBrowser.runtime.sendMessage).toHaveBeenCalledWith(message);
    });

    it("should handle custom message types", async () => {
      const customMessage = {
        type: "GET_SERVICE_BY_URL" as const,
        url: "https://example.com",
        timestamp: Date.now(),
      };

      await handler.sendToBackground(customMessage);

      expect((globalThis as any).fakeBrowser.runtime.sendMessage).toHaveBeenCalledWith(
        customMessage,
      );
    });
  });

  describe("Initialization", () => {
    it("should handle browser API not available during initialization", () => {
      (globalThis as any).fakeBrowser = {
        runtime: {
          sendMessage: vi.fn(),
          // onMessage APIを削除
        },
      };

      // コンソールの警告をモック
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      expect(() => {
        new ContentMessageHandler();
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith("Browser message API not available");

      consoleSpy.mockRestore();
    });
  });
});
