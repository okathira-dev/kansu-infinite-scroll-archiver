/**
 * Database operations tests
 * データベース操作のテスト
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  db,
  deleteServiceConfig,
  getAllServiceConfigs,
  getDatabaseStats,
  getServiceConfig,
  getServiceConfigByUrl,
  saveExtractedData,
  saveServiceConfig,
  searchExtractedData,
  updateServiceConfig,
} from "./database";
import type { CreateExtractedData, CreateServiceConfig } from "./types";

describe("Database Operations", () => {
  beforeEach(async () => {
    // テスト前にデータベースをクリア
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    // テスト後にデータベースをクリア
    await db.delete();
  });

  describe("Service Configuration", () => {
    it("should save and retrieve service config", async () => {
      const testService: CreateServiceConfig = {
        name: "Twitter",
        urlPattern: "https://twitter\\.com/.*",
        fields: [
          {
            id: "username",
            name: "ユーザー名",
            type: "text",
            extractor: { selector: ".profile-name" },
            searchable: true,
            sortable: true,
            order: 1,
            required: true,
          },
          {
            id: "tweet",
            name: "ツイート",
            type: "text",
            extractor: { selector: ".tweet-text" },
            searchable: true,
            sortable: false,
            order: 2,
            required: true,
          },
        ],
        enabled: true,
        description: "テスト用のTwitterサービス設定",
      };

      // 保存
      const serviceId = await saveServiceConfig(testService);
      expect(serviceId).toBeDefined();

      // 取得
      const savedService = await getServiceConfig(serviceId);
      expect(savedService).toBeDefined();
      expect(savedService?.name).toBe(testService.name);
      expect(savedService?.urlPattern).toBe(testService.urlPattern);
      expect(savedService?.fields).toHaveLength(2);
      expect(savedService?.enabled).toBe(true);
      expect(savedService?.createdAt).toBeInstanceOf(Date);
      expect(savedService?.updatedAt).toBeInstanceOf(Date);
    });

    it("should update service config", async () => {
      // 初期データを保存
      const testService: CreateServiceConfig = {
        name: "Original Name",
        urlPattern: "https://example\\.com/.*",
        fields: [],
        enabled: true,
      };

      const serviceId = await saveServiceConfig(testService);

      // 更新
      await updateServiceConfig(serviceId, {
        name: "Updated Name",
        enabled: false,
      });

      // 更新後のデータを確認
      const updatedService = await getServiceConfig(serviceId);
      expect(updatedService?.name).toBe("Updated Name");
      expect(updatedService?.enabled).toBe(false);
      expect(updatedService?.urlPattern).toBe(testService.urlPattern); // 変更していない項目は保持
      expect(updatedService?.updatedAt.getTime()).toBeGreaterThan(
        updatedService?.createdAt.getTime(),
      );
    });

    it("should get all service configs", async () => {
      // 複数のサービス設定を保存
      const service1: CreateServiceConfig = {
        name: "Service 1",
        urlPattern: "https://site1\\.com/.*",
        fields: [],
        enabled: true,
      };

      const service2: CreateServiceConfig = {
        name: "Service 2",
        urlPattern: "https://site2\\.com/.*",
        fields: [],
        enabled: false,
      };

      await saveServiceConfig(service1);
      await saveServiceConfig(service2);

      // 全件取得
      const allServices = await getAllServiceConfigs();
      expect(allServices).toHaveLength(2);
      expect(allServices.map((s) => s.name)).toContain("Service 1");
      expect(allServices.map((s) => s.name)).toContain("Service 2");
    });

    it("should find service by URL pattern", async () => {
      const twitterService: CreateServiceConfig = {
        name: "Twitter",
        urlPattern: "https://twitter\\.com/.*",
        fields: [],
        enabled: true,
      };

      const facebookService: CreateServiceConfig = {
        name: "Facebook",
        urlPattern: "https://facebook\\.com/.*",
        fields: [],
        enabled: true,
      };

      await saveServiceConfig(twitterService);
      await saveServiceConfig(facebookService);

      // URLパターンでサービスを検索
      const foundService = await getServiceConfigByUrl("https://twitter.com/user123");
      expect(foundService).toBeDefined();
      expect(foundService?.name).toBe("Twitter");

      // マッチしないURLの場合
      const notFound = await getServiceConfigByUrl("https://github.com/user");
      expect(notFound).toBeUndefined();
    });

    it("should delete service config and related data", async () => {
      // サービス設定を保存
      const testService: CreateServiceConfig = {
        name: "Test Service",
        urlPattern: "https://test\\.com/.*",
        fields: [],
        enabled: true,
      };

      const serviceId = await saveServiceConfig(testService);

      // 関連する抽出データも保存
      const testData: CreateExtractedData[] = [
        {
          serviceId,
          sourceUrl: "https://test.com/page1",
          fieldData: { title: "Test Title" },
        },
      ];

      await saveExtractedData(testData);

      // サービスを削除
      await deleteServiceConfig(serviceId);

      // サービス設定が削除されていることを確認
      const deletedService = await getServiceConfig(serviceId);
      expect(deletedService).toBeUndefined();

      // 関連データも削除されていることを確認
      const searchResult = await searchExtractedData({ serviceId });
      expect(searchResult.data).toHaveLength(0);
    });
  });

  describe("Extracted Data", () => {
    let testServiceId: string;

    beforeEach(async () => {
      // テスト用のサービス設定を作成
      const testService: CreateServiceConfig = {
        name: "Test Service",
        urlPattern: "https://test\\.com/.*",
        fields: [
          {
            id: "title",
            name: "タイトル",
            type: "text",
            extractor: { selector: ".title" },
            searchable: true,
            sortable: true,
            order: 1,
            required: true,
          },
        ],
        enabled: true,
      };

      testServiceId = await saveServiceConfig(testService);
    });

    it("should save extracted data", async () => {
      const testData: CreateExtractedData[] = [
        {
          serviceId: testServiceId,
          sourceUrl: "https://test.com/page1",
          fieldData: {
            title: "Test Title 1",
            content: "Test Content 1",
          },
        },
        {
          serviceId: testServiceId,
          sourceUrl: "https://test.com/page2",
          fieldData: {
            title: "Test Title 2",
            content: "Test Content 2",
          },
        },
      ];

      const savedCount = await saveExtractedData(testData);
      expect(savedCount).toBe(2);

      // 保存されたデータを検索で確認
      const searchResult = await searchExtractedData({ serviceId: testServiceId });
      expect(searchResult.data).toHaveLength(2);
      expect(searchResult.totalCount).toBe(2);
    });

    it("should prevent duplicate data", async () => {
      const testData: CreateExtractedData[] = [
        {
          serviceId: testServiceId,
          sourceUrl: "https://test.com/page1",
          fieldData: { title: "Same Title" },
        },
      ];

      // 同じデータを2回保存
      const savedCount1 = await saveExtractedData(testData);
      const savedCount2 = await saveExtractedData(testData);

      expect(savedCount1).toBe(1);
      expect(savedCount2).toBe(0); // 重複なので保存されない

      // データベース内には1件のみ存在することを確認
      const searchResult = await searchExtractedData({ serviceId: testServiceId });
      expect(searchResult.data).toHaveLength(1);
    });

    it("should search data with keyword", async () => {
      const testData: CreateExtractedData[] = [
        {
          serviceId: testServiceId,
          sourceUrl: "https://test.com/page1",
          fieldData: { title: "JavaScript Tutorial" },
        },
        {
          serviceId: testServiceId,
          sourceUrl: "https://test.com/page2",
          fieldData: { title: "Python Guide" },
        },
        {
          serviceId: testServiceId,
          sourceUrl: "https://test.com/page3",
          fieldData: { title: "Java Programming" },
        },
      ];

      await saveExtractedData(testData);

      // JavaScript で検索
      const searchResult1 = await searchExtractedData({
        serviceId: testServiceId,
        keyword: "JavaScript",
      });
      expect(searchResult1.data).toHaveLength(1);
      expect(searchResult1.data[0].fieldData.title).toBe("JavaScript Tutorial");

      // Python で検索
      const searchResult2 = await searchExtractedData({
        serviceId: testServiceId,
        keyword: "Python",
      });
      expect(searchResult2.data).toHaveLength(1);
      expect(searchResult2.data[0].fieldData.title).toBe("Python Guide");

      // 存在しないキーワードで検索
      const searchResult3 = await searchExtractedData({
        serviceId: testServiceId,
        keyword: "PHP",
      });
      expect(searchResult3.data).toHaveLength(0);
    });

    it("should handle pagination", async () => {
      // 10件のテストデータを作成
      const testData: CreateExtractedData[] = Array.from({ length: 10 }, (_, i) => ({
        serviceId: testServiceId,
        sourceUrl: `https://test.com/page${i + 1}`,
        fieldData: { title: `Title ${i + 1}` },
      }));

      await saveExtractedData(testData);

      // ページサイズ3で1ページ目を取得
      const page1 = await searchExtractedData({
        serviceId: testServiceId,
        page: 1,
        pageSize: 3,
      });

      expect(page1.data).toHaveLength(3);
      expect(page1.currentPage).toBe(1);
      expect(page1.totalPages).toBe(4); // 10件 ÷ 3 = 4ページ
      expect(page1.totalCount).toBe(10);

      // 2ページ目を取得
      const page2 = await searchExtractedData({
        serviceId: testServiceId,
        page: 2,
        pageSize: 3,
      });

      expect(page2.data).toHaveLength(3);
      expect(page2.currentPage).toBe(2);
    });
  });

  describe("Database Statistics", () => {
    it("should get database statistics", async () => {
      // 初期状態では空
      const initialStats = await getDatabaseStats();
      expect(initialStats.serviceCount).toBe(0);
      expect(initialStats.dataCount).toBe(0);

      // テストデータを追加
      const testService: CreateServiceConfig = {
        name: "Test Service",
        urlPattern: "https://test\\.com/.*",
        fields: [],
        enabled: true,
      };

      const serviceId = await saveServiceConfig(testService);

      const testData: CreateExtractedData[] = [
        {
          serviceId,
          sourceUrl: "https://test.com/page1",
          fieldData: { title: "Test Title" },
        },
      ];

      await saveExtractedData(testData);

      // 統計情報を確認
      const stats = await getDatabaseStats();
      expect(stats.serviceCount).toBe(1);
      expect(stats.dataCount).toBe(1);
      expect(stats.totalSize).toBeGreaterThan(0);
    });
  });
});
