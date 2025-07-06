/**
 * UI Injector
 * ページへのUI注入を管理するクラス
 */

/**
 * UI注入管理クラス
 */
export class UIInjector {
  private container: HTMLElement | null = null;
  private isVisible = false;
  private readonly containerId = "kansu-ui-container";

  constructor() {
    console.log("UIInjector initialized");
  }

  /**
   * UIを表示
   */
  async show(): Promise<void> {
    try {
      if (!this.container) {
        await this.createContainer();
      }

      if (this.container) {
        this.container.style.display = "block";
        this.isVisible = true;
        console.log("UI shown");
      }
    } catch (error) {
      console.error("Failed to show UI:", error);
    }
  }

  /**
   * UIを非表示
   */
  async hide(): Promise<void> {
    try {
      if (this.container) {
        this.container.style.display = "none";
        this.isVisible = false;
        console.log("UI hidden");
      }
    } catch (error) {
      console.error("Failed to hide UI:", error);
    }
  }

  /**
   * UIの表示状態を取得
   */
  isUIVisible(): boolean {
    return this.isVisible;
  }

  /**
   * UIコンテナを作成
   */
  private async createContainer(): Promise<void> {
    // 既存のコンテナをチェック
    const existingContainer = document.getElementById(this.containerId);
    if (existingContainer) {
      this.container = existingContainer;
      return;
    }

    // 新しいコンテナを作成
    const container = document.createElement("div");
    container.id = this.containerId;
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      max-height: 600px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: none;
    `;

    // 基本的なUI構造を作成
    container.innerHTML = `
      <div style="padding: 16px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Kansu Data Viewer</h3>
        <button id="kansu-close-btn" style="background: none; border: none; font-size: 18px; cursor: pointer; padding: 4px;">×</button>
      </div>
      <div style="padding: 16px;">
        <div id="kansu-content">
          <p style="margin: 0; color: #666; font-size: 14px;">データの読み込み中...</p>
        </div>
      </div>
    `;

    // 閉じるボタンのイベントハンドラー
    const closeBtn = container.querySelector("#kansu-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.hide();
      });
    }

    // ページに追加
    document.body.appendChild(container);
    this.container = container;

    console.log("UI container created");
  }

  /**
   * UIコンテンツを更新
   */
  async updateContent(content: HTMLElement | string): Promise<void> {
    if (!this.container) {
      await this.createContainer();
    }

    const contentElement = this.container?.querySelector("#kansu-content");
    if (contentElement) {
      if (typeof content === "string") {
        contentElement.innerHTML = content;
      } else {
        contentElement.innerHTML = "";
        contentElement.appendChild(content);
      }
    }
  }

  /**
   * UIを削除
   */
  async destroy(): Promise<void> {
    if (this.container) {
      this.container.remove();
      this.container = null;
      this.isVisible = false;
      console.log("UI destroyed");
    }
  }
}
