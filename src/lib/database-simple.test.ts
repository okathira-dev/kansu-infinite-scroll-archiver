/**
 * Simple Database Test
 * 基本的なデータベース機能のテスト
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { KansuDatabase } from "./database";

describe("Basic Database Operations", () => {
  let db: KansuDatabase;

  beforeEach(async () => {
    // 各テスト前に新しいデータベースインスタンスを作成
    db = new KansuDatabase();
    await db.open();
  });

  afterEach(async () => {
    // テスト後にデータベースを削除
    await db.delete();
  });

  it("should create database instance", () => {
    expect(db).toBeDefined();
    expect(db.name).toBe("KansuDB");
  });

  it("should save and retrieve service config", async () => {
    const testService = {
      id: "1",
      name: "Test Service",
      urlPattern: "https://test\\.com/.*",
      fields: [],
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.services.add(testService);

    const retrieved = await db.services.get("1");
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe("Test Service");
  });

  it("should save extracted data", async () => {
    const testData = {
      id: "1",
      serviceId: "service1",
      sourceUrl: "https://test.com/page1",
      fieldData: { title: "Test Title" },
      extractedAt: new Date(),
      hash: "testhash",
    };

    await db.extractedData.add(testData);

    const retrieved = await db.extractedData.get("1");
    expect(retrieved).toBeDefined();
    expect(retrieved?.fieldData.title).toBe("Test Title");
  });
});
