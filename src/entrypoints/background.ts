/**
 * Background Service
 * バックグラウンドサービス - データ管理とメッセージ処理の中核
 */

import {
  deleteServiceConfig,
  exportServiceData,
  getAllServiceConfigs,
  getServiceConfigByUrl,
  importServiceData,
  saveExtractedData,
  saveServiceConfig,
  searchExtractedData,
} from "../lib/database";
import type {
  BaseMessage,
  DeleteServiceMessage,
  ExportData,
  ExportDataMessage,
  GetServiceByUrlMessage,
  GetUIStateMessage,
  ImportDataMessage,
  MessageResponse,
  SaveDataMessage,
  SaveServiceMessage,
  SearchDataMessage,
  SearchResult,
  ServiceConfig,
  ToggleUIMessage,
  UIState,
} from "../lib/types";

export default defineBackground(() => {
  console.log("Kansu Background Service started", { id: browser.runtime.id });

  // メッセージリスナーを登録
  browser.runtime.onMessage.addListener(handleMessage);

  /**
   * メッセージハンドラー
   * Content ScriptやPopup UIからのメッセージを処理する
   */
  async function handleMessage(
    message: BaseMessage,
    _sender: browser.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void,
  ): Promise<void> {
    try {
      // メッセージIDが必要
      if (!message.messageId) {
        const errorResponse: MessageResponse = {
          messageId: "unknown",
          success: false,
          error: "Message ID is required",
        };
        sendResponse(errorResponse);
        return;
      }

      console.log("Received message:", message.type, message);

      let result: unknown;

      switch (message.type) {
        case "SAVE_DATA":
          result = await handleSaveData(message as SaveDataMessage);
          break;

        case "SEARCH_DATA":
          result = await handleSearchData(message as SearchDataMessage);
          break;

        case "GET_SERVICES":
          result = await handleGetServices();
          break;

        case "GET_SERVICE_BY_URL":
          result = await handleGetServiceByUrl(message as GetServiceByUrlMessage);
          break;

        case "SAVE_SERVICE":
          result = await handleSaveService(message as SaveServiceMessage);
          break;

        case "DELETE_SERVICE":
          result = await handleDeleteService(message as DeleteServiceMessage);
          break;

        case "EXPORT_DATA":
          result = await handleExportData(message as ExportDataMessage);
          break;

        case "IMPORT_DATA":
          result = await handleImportData(message as ImportDataMessage);
          break;

        case "TOGGLE_UI":
          result = await handleToggleUI(message as ToggleUIMessage);
          break;

        case "GET_UI_STATE":
          result = await handleGetUIState(message as GetUIStateMessage);
          break;

        default:
          throw new Error(`Unknown message type: ${message.type}`);
      }

      const response: MessageResponse = {
        messageId: message.messageId,
        success: true,
        data: result,
      };

      sendResponse(response);
    } catch (error) {
      console.error("Error handling message:", error);

      const errorResponse: MessageResponse = {
        messageId: message.messageId || "unknown",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };

      sendResponse(errorResponse);
    }
  }

  /**
   * データ保存処理
   */
  async function handleSaveData(message: SaveDataMessage): Promise<number> {
    console.log("Saving data:", message.data.length, "items");
    return await saveExtractedData(message.data);
  }

  /**
   * データ検索処理
   */
  async function handleSearchData(message: SearchDataMessage): Promise<SearchResult> {
    console.log("Searching data with params:", message.params);
    return await searchExtractedData(message.params);
  }

  /**
   * サービス設定取得処理
   */
  async function handleGetServices(): Promise<ServiceConfig[]> {
    console.log("Getting all services");
    return await getAllServiceConfigs();
  }

  /**
   * URLに対応するサービス設定取得処理
   */
  async function handleGetServiceByUrl(
    message: GetServiceByUrlMessage,
  ): Promise<ServiceConfig | undefined> {
    console.log("Getting service by URL:", message.url);
    return await getServiceConfigByUrl(message.url);
  }

  /**
   * サービス設定保存処理
   */
  async function handleSaveService(message: SaveServiceMessage): Promise<string> {
    console.log("Saving service:", message.service);
    return await saveServiceConfig(message.service);
  }

  /**
   * サービス設定削除処理
   */
  async function handleDeleteService(message: DeleteServiceMessage): Promise<void> {
    console.log("Deleting service:", message.serviceId);
    return await deleteServiceConfig(message.serviceId);
  }

  /**
   * データエクスポート処理
   */
  async function handleExportData(message: ExportDataMessage): Promise<ExportData> {
    console.log("Exporting data for service:", message.serviceId);
    return await exportServiceData(message.serviceId);
  }

  /**
   * データインポート処理
   */
  async function handleImportData(message: ImportDataMessage): Promise<void> {
    console.log("Importing data:", message.data);
    return await importServiceData(message.data);
  }

  /**
   * UI表示切り替え処理
   */
  async function handleToggleUI(message: ToggleUIMessage): Promise<boolean> {
    console.log("Toggling UI for tab:", message.tabId);

    // Content Scriptにメッセージを送信してUI表示を切り替え
    try {
      await browser.tabs.sendMessage(message.tabId, {
        type: "TOGGLE_UI_VISIBILITY",
        visible: message.visible,
      });
      return message.visible;
    } catch (error) {
      console.error("Failed to toggle UI:", error);
      throw error;
    }
  }

  /**
   * UI状態取得処理
   */
  async function handleGetUIState(_message: GetUIStateMessage): Promise<UIState> {
    console.log("Getting UI state");

    // TODO: UI状態の管理機能を実装
    return {
      visible: false,
      currentSearch: {},
      loading: false,
    };
  }
});
