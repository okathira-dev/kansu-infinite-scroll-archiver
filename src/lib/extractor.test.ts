/**
 * Data Extractor Tests
 * データ抽出エンジンのunitテスト
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataExtractor } from "./extractor";
import type { ServiceConfig } from "./types";

describe("DataExtractor", () => {
  let extractor: DataExtractor;

  const mockServiceConfig: ServiceConfig = {
    id: "test-service",
    name: "Test Service",
    urlPattern: "https://test.com/*",
    enabled: true,
    fields: [
      {
        id: "title",
        name: "Title",
        type: "text" as const,
        extractor: {
          selector: ".title",
        },
        searchable: true,
        sortable: true,
        order: 1,
        required: true,
      },
      {
        id: "content",
        name: "Content",
        type: "text" as const,
        extractor: {
          selector: ".content",
        },
        searchable: true,
        sortable: false,
        order: 2,
        required: false,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    extractor = new DataExtractor();
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  describe("Configuration", () => {
    it("should configure extractor with service config", async () => {
      await extractor.configure(mockServiceConfig);

      // 設定が正しく保存されているかは内部実装なので、
      // 実際の抽出動作で確認する
      expect(extractor).toBeDefined();
    });

    it("should handle invalid service config", async () => {
      const invalidConfig = {
        ...mockServiceConfig,
        fields: [],
      };

      await extractor.configure(invalidConfig);

      // フィールドがない場合でもエラーにならないことを確認
      expect(extractor).toBeDefined();
    });
  });

  describe("Data Extraction", () => {
    beforeEach(async () => {
      await extractor.configure(mockServiceConfig);
    });

    it("should extract data from single element", async () => {
      document.body.innerHTML = `
        <div class="title">Test Title</div>
        <div class="content">Test Content</div>
      `;

      const extracted = await extractor.extractFromDOM(document);

      expect(extracted).toHaveLength(1);
      expect(extracted[0].fieldData.title).toBe("Test Title");
      expect(extracted[0].fieldData.content).toBe("Test Content");
      expect(extracted[0].serviceId).toBe("test-service");
      expect(extracted[0].sourceUrl).toBe(window.location.href);
    });

    it("should extract data from multiple item containers", async () => {
      document.body.innerHTML = `
        <div class="item">
          <div class="title">Title 1</div>
          <div class="content">Content 1</div>
        </div>
        <div class="item">
          <div class="title">Title 2</div>
          <div class="content">Content 2</div>
        </div>
      `;

      // 複数アイテム対応のconfig
      const multiItemConfig: ServiceConfig = {
        ...mockServiceConfig,
        fields: [
          {
            id: "title",
            name: "Title",
            type: "text" as const,
            extractor: { selector: ".item .title" },
            searchable: true,
            sortable: true,
            order: 1,
            required: true,
          },
          {
            id: "content",
            name: "Content",
            type: "text" as const,
            extractor: { selector: ".item .content" },
            searchable: true,
            sortable: false,
            order: 2,
            required: false,
          },
        ],
      };

      await extractor.configure(multiItemConfig);
      const extracted = await extractor.extractFromDOM(document);

      expect(extracted).toHaveLength(2);
      expect(extracted[0].fieldData.title).toBe("Title 1");
      expect(extracted[1].fieldData.title).toBe("Title 2");
    });

    it("should handle missing elements gracefully", async () => {
      document.body.innerHTML = `
        <div class="title">Title Only</div>
      `;

      const extracted = await extractor.extractFromDOM(document);

      expect(extracted).toHaveLength(1);
      expect(extracted[0].fieldData.title).toBe("Title Only");
      expect(extracted[0].fieldData.content).toBeUndefined();
    });

    it("should handle invalid selectors", async () => {
      const invalidConfig: ServiceConfig = {
        ...mockServiceConfig,
        fields: [
          {
            id: "invalid",
            name: "Invalid",
            type: "text" as const,
            extractor: { selector: "invalid>>>>selector" },
            searchable: true,
            sortable: true,
            order: 1,
            required: true,
          },
        ],
      };

      await extractor.configure(invalidConfig);
      const extracted = await extractor.extractFromDOM(document);

      // 無効なセレクターでもエラーにならず、空配列を返す
      expect(extracted).toEqual([]);
    });
  });

  describe("DOM Observation", () => {
    beforeEach(async () => {
      await extractor.configure(mockServiceConfig);
    });

    it("should start and stop DOM observation", async () => {
      const callback = vi.fn();
      extractor.onDataExtracted(callback);

      await extractor.start();

      // DOM変更をシミュレート
      const newElement = document.createElement("div");
      newElement.className = "title";
      newElement.textContent = "New Title";
      document.body.appendChild(newElement);

      // MutationObserverの処理を待つ
      await new Promise((resolve) => setTimeout(resolve, 100));

      await extractor.stop();

      // コールバックが呼ばれることを確認
      expect(callback).toHaveBeenCalled();
    });

    it("should handle multiple callbacks", async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      extractor.onDataExtracted(callback1);
      extractor.onDataExtracted(callback2);

      await extractor.start();

      // DOM変更をシミュレート
      document.body.innerHTML = `<div class="title">Test</div>`;

      // MutationObserverの処理を待つ
      await new Promise((resolve) => setTimeout(resolve, 100));

      await extractor.stop();

      // 両方のコールバックが呼ばれることを確認
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle extraction without configuration", async () => {
      const extracted = await extractor.extractFromDOM(document);
      expect(extracted).toEqual([]);
    });

    it("should handle null/undefined DOM", async () => {
      await extractor.configure(mockServiceConfig);

      // @ts-ignore - テスト用に無効な引数を渡す
      const extracted = await extractor.extractFromDOM(null);
      expect(extracted).toEqual([]);
    });
  });
});
