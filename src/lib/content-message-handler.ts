/**
 * Content Message Handler
 * Content Script用のメッセージ送受信を管理するクラス
 */

import type { MessageResponse } from "@/lib/types";

/**
 * Content Script用メッセージハンドラー
 */
export class ContentMessageHandler {
  // TODO: 型安全性の改善 - メッセージ型を適切に定義する
  // 現在は any 型を使用しているが、BaseMessage またはその派生型を使用するべき
  private messageListeners: ((message: any) => void)[] = [];

  constructor() {
    this.setupMessageListener();
    console.log("ContentMessageHandler initialized");
  }

  /**
   * Background Serviceにメッセージを送信
   */
  // TODO: 型安全性の改善 - メッセージ型を BaseMessage に変更する
  // 現在は any 型だが、適切なメッセージ型（SaveDataMessage等）を使用するべき
  async sendToBackground(message: any): Promise<MessageResponse> {
    try {
      // テスト環境での対応
      // TODO: テスト環境のfakeBrowser型定義を改善する
      // globalThis as any の使用を避けて、適切な型定義を作成する
      const browserAPI = typeof browser !== "undefined" ? browser : (globalThis as any).fakeBrowser;

      if (!browserAPI?.runtime?.sendMessage) {
        throw new Error("Browser API not available");
      }

      const response = await browserAPI.runtime.sendMessage(message);
      return response;
    } catch (error) {
      console.error("Failed to send message to background:", error);
      throw error;
    }
  }

  /**
   * メッセージリスナーを設定
   */
  // TODO: 型安全性の改善 - メッセージ型を適切に定義する
  // Background Serviceから受信するメッセージの型を定義する
  onMessage(callback: (message: any) => void): void {
    this.messageListeners.push(callback);
  }

  /**
   * メッセージリスナーを削除
   */
  // TODO: 型安全性の改善 - メッセージ型を適切に定義する
  removeMessageListener(callback: (message: any) => void): void {
    const index = this.messageListeners.indexOf(callback);
    if (index > -1) {
      this.messageListeners.splice(index, 1);
    }
  }

  /**
   * Background Serviceからのメッセージを受信するためのリスナー設定
   */
  private setupMessageListener(): void {
    // テスト環境での対応
    // TODO: テスト環境のfakeBrowser型定義を改善する
    const browserAPI = typeof browser !== "undefined" ? browser : (globalThis as any).fakeBrowser;

    if (!browserAPI?.runtime?.onMessage?.addListener) {
      console.warn("Browser message listener not available");
      return;
    }

    // TODO: 型安全性の改善 - Browser API の型定義を改善する
    // message, sender, sendResponse の型を適切に定義する
    // 未使用パラメータには _ プレフィックスを追加済み
    browserAPI.runtime.onMessage.addListener((message: any, _sender: any, _sendResponse: any) => {
      console.log("Content Script received message:", message);

      // 登録されたリスナーに通知
      this.messageListeners.forEach((listener) => {
        try {
          listener(message);
        } catch (error) {
          console.error("Error in message listener:", error);
        }
      });

      // 非同期処理の場合はtrueを返す
      return false;
    });
  }
}
