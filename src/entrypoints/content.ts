/**
 * Content Script - Main Entry Point
 *
 * 責務：
 * 1. DOM監視とデータ抽出
 * 2. Background Serviceとの通信
 * 3. メインUIの注入と管理
 */

import { ContentMessageHandler } from "@/lib/content-message-handler";
import { DataExtractor } from "@/lib/extractor";
import type { CreateExtractedData, ServiceConfig } from "@/lib/types";
import { UIInjector } from "@/lib/ui-injector";

export default defineContentScript({
  // 全てのHTTPSサイトで動作（後で設定可能にする）
  matches: ["https://*/*"],

  // Main関数でContent Scriptを初期化
  main() {
    console.log("Kansu Content Script initialized");

    // Content Scriptのメインクラスを初期化
    new KansuContentScript();
  },
});

/**
 * Content Scriptのメインクラス
 */
class KansuContentScript {
  private extractor: DataExtractor;
  private uiInjector: UIInjector;
  private messageHandler: ContentMessageHandler;
  private currentServiceConfig: ServiceConfig | null = null;
  private isActive = false;

  constructor() {
    this.extractor = new DataExtractor();
    this.uiInjector = new UIInjector();
    this.messageHandler = new ContentMessageHandler();

    this.init();
  }

  /**
   * Content Scriptの初期化
   */
  private async init(): Promise<void> {
    try {
      // 現在のURLに対応するサービス設定を取得
      await this.loadServiceConfig();

      // Background Serviceからのメッセージを監視
      this.setupMessageListener();

      // サービス設定があれば抽出を開始
      if (this.currentServiceConfig) {
        await this.startExtraction();
      }

      console.log("Content Script initialized successfully");
    } catch (error) {
      console.error("Content Script initialization failed:", error);
    }
  }

  /**
   * サービス設定の読み込み
   */
  private async loadServiceConfig(): Promise<void> {
    try {
      const response = await this.messageHandler.sendToBackground({
        type: "GET_SERVICE_BY_URL",
        url: window.location.href,
      });

      if (response.success && response.data) {
        this.currentServiceConfig = response.data;
        console.log("Service config loaded:", this.currentServiceConfig.name);
      }
    } catch (error) {
      console.error("Failed to load service config:", error);
    }
  }

  /**
   * Background Serviceからのメッセージを監視
   */
  private setupMessageListener(): void {
    this.messageHandler.onMessage((message) => {
      switch (message.type) {
        case "TOGGLE_UI_VISIBILITY":
          this.handleToggleUI(message.visible);
          break;
        case "UPDATE_SERVICE_CONFIG":
          this.handleServiceConfigUpdate(message.config);
          break;
        case "START_EXTRACTION":
          this.startExtraction();
          break;
        case "STOP_EXTRACTION":
          this.stopExtraction();
          break;
        default:
          console.warn("Unknown message type:", message.type);
      }
    });
  }

  /**
   * UI表示切り替え処理
   */
  private async handleToggleUI(visible: boolean): Promise<void> {
    if (visible) {
      await this.uiInjector.show();
    } else {
      await this.uiInjector.hide();
    }
  }

  /**
   * サービス設定更新処理
   */
  private async handleServiceConfigUpdate(config: ServiceConfig): Promise<void> {
    this.currentServiceConfig = config;

    // 抽出器を再設定
    if (this.isActive) {
      await this.stopExtraction();
      await this.startExtraction();
    }
  }

  /**
   * データ抽出開始
   */
  private async startExtraction(): Promise<void> {
    if (!this.currentServiceConfig || this.isActive) {
      return;
    }

    try {
      // 抽出器を設定
      await this.extractor.configure(this.currentServiceConfig);

      // 抽出器にデータハンドラーを設定
      this.extractor.onDataExtracted((data) => {
        this.handleExtractedData(data);
      });

      // 抽出開始
      await this.extractor.start();

      this.isActive = true;
      console.log("Data extraction started");
    } catch (error) {
      console.error("Failed to start extraction:", error);
    }
  }

  /**
   * データ抽出停止
   */
  private async stopExtraction(): Promise<void> {
    if (!this.isActive) {
      return;
    }

    try {
      await this.extractor.stop();
      this.isActive = false;
      console.log("Data extraction stopped");
    } catch (error) {
      console.error("Failed to stop extraction:", error);
    }
  }

  /**
   * 抽出されたデータの処理
   */
  private async handleExtractedData(data: CreateExtractedData[]): Promise<void> {
    if (data.length === 0) {
      return;
    }

    try {
      // Background Serviceにデータを送信
      const response = await this.messageHandler.sendToBackground({
        type: "SAVE_DATA",
        data: data,
      });

      if (response.success) {
        console.log(`Saved ${response.data.savedCount} new items`);
      }
    } catch (error) {
      console.error("Failed to save extracted data:", error);
    }
  }
}
