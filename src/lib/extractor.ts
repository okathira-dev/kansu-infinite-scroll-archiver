/**
 * Data Extractor
 * DOM監視とデータ抽出を行うクラス
 */

import type { CreateExtractedData, ExtractorRule, Field, ServiceConfig } from "@/lib/types";

/**
 * データ抽出エンジン
 */
export class DataExtractor {
  private config: ServiceConfig | null = null;
  private observer: MutationObserver | null = null;
  private isObserving = false;
  private dataCallback: ((data: CreateExtractedData[]) => void) | null = null;
  private extractedHashes = new Set<string>();

  constructor() {
    console.log("DataExtractor initialized");
  }

  /**
   * サービス設定を設定
   */
  async configure(config: ServiceConfig): Promise<void> {
    this.config = config;
    console.log("DataExtractor configured for service:", config.name);
  }

  /**
   * データ抽出コールバックを設定
   */
  onDataExtracted(callback: (data: CreateExtractedData[]) => void): void {
    this.dataCallback = callback;
  }

  /**
   * DOM監視を開始
   */
  async start(): Promise<void> {
    if (!this.config || this.isObserving) {
      return;
    }

    try {
      // 初期データを抽出
      const initialData = await this.extractFromDOM(document);
      if (initialData.length > 0 && this.dataCallback) {
        this.dataCallback(initialData);
      }

      // MutationObserverを設定
      this.observer = new MutationObserver(this.handleMutations.bind(this));

      // 監視を開始
      const targetNode = this.config.scrollContainer
        ? document.querySelector(this.config.scrollContainer)
        : document.body;

      if (targetNode) {
        this.observer.observe(targetNode, {
          childList: true,
          subtree: true,
        });

        this.isObserving = true;
        console.log("DOM observation started");
      }
    } catch (error) {
      console.error("Failed to start DOM observation:", error);
    }
  }

  /**
   * DOM監視を停止
   */
  async stop(): Promise<void> {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      this.isObserving = false;
      console.log("DOM observation stopped");
    }
  }

  /**
   * DOMからデータを抽出
   */
  async extractFromDOM(doc: Document): Promise<CreateExtractedData[]> {
    if (!this.config) {
      return [];
    }

    try {
      const results: CreateExtractedData[] = [];
      const sourceUrl = window.location.href;

      // 各フィールドについてデータを抽出
      for (const field of this.config.fields) {
        const fieldData = await this.extractFieldData(doc, field);

        // 複数の要素が見つかった場合、それぞれを個別のデータとして処理
        if (fieldData.length > 0) {
          for (const data of fieldData) {
            const hash = this.generateHash(data);

            // 重複チェック
            if (!this.extractedHashes.has(hash)) {
              results.push({
                serviceId: this.config.id,
                sourceUrl,
                fieldData: data,
              });
              this.extractedHashes.add(hash);
            }
          }
        }
      }

      // 単一フィールドの場合は結合処理
      if (this.config.fields.length === 1) {
        return results;
      }

      // 複数フィールドの場合は結合処理（今回は単純実装）
      return results;
    } catch (error) {
      console.error("Failed to extract data from DOM:", error);
      return [];
    }
  }

  /**
   * フィールドデータを抽出
   */
  // TODO: 型安全性の改善 - 戻り値の型を改善する
  // 現在は Record<string, any>[] だが、より具体的な型を定義することを検討
  private async extractFieldData(doc: Document, field: Field): Promise<Record<string, any>[]> {
    try {
      const elements = doc.querySelectorAll(field.extractor.selector);
      // TODO: 型安全性の改善 - 抽出結果の型を改善する
      // 現在は Record<string, any> だが、フィールドタイプに応じた型を定義することを検討
      const results: Record<string, any>[] = [];

      for (const element of elements) {
        const value = this.extractValueFromElement(element, field.extractor);
        if (value !== null) {
          results.push({
            [field.id]: value,
          });
        }
      }

      return results;
    } catch (error) {
      console.error(`Field extraction failed for ${field.name}:`, error);
      return [];
    }
  }

  /**
   * 要素から値を抽出
   */
  // TODO: 型安全性の改善 - 戻り値の型を改善する
  // 現在は any だが、フィールドタイプ（text, url, image, number, date）に応じた型を定義することを検討
  private extractValueFromElement(element: Element, extractor: ExtractorRule): any {
    try {
      // TODO: 型安全性の改善 - 抽出値の型を改善する
      // 現在は any だが、ExtractorRule の属性に応じた型を定義することを検討
      let value: any;

      if (extractor.attribute) {
        // 属性値を取得
        value = element.getAttribute(extractor.attribute);
      } else {
        // テキストコンテンツを取得
        value = element.textContent?.trim() || "";
      }

      // データ変換
      if (value && extractor.transform) {
        switch (extractor.transform) {
          case "trim":
            value = value.toString().trim();
            break;
          case "lowercase":
            value = value.toString().toLowerCase();
            break;
          case "uppercase":
            value = value.toString().toUpperCase();
            break;
        }
      }

      return value;
    } catch (error) {
      console.error("Value extraction failed:", error);
      return null;
    }
  }

  /**
   * DOM変更を処理
   */
  private async handleMutations(mutations: MutationRecord[]): Promise<void> {
    if (!this.config || !this.dataCallback) {
      return;
    }

    let hasNewContent = false;

    for (const mutation of mutations) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        hasNewContent = true;
        break;
      }
    }

    if (hasNewContent) {
      // 新しいコンテンツが追加された場合、抽出を実行
      // テスト環境でのタイミング調整
      const delay = typeof process !== "undefined" && process.env.NODE_ENV === "test" ? 10 : 500;

      setTimeout(async () => {
        try {
          const newData = await this.extractFromDOM(document);
          if (newData.length > 0 && this.dataCallback) {
            this.dataCallback(newData);
          }
        } catch (error) {
          console.error("Failed to extract data after DOM mutation:", error);
        }
      }, delay);
    }
  }

  /**
   * データのハッシュ値を生成
   */
  // TODO: 型安全性の改善 - 入力データの型を改善する
  // 現在は Record<string, any> だが、より具体的な型を定義することを検討
  private generateHash(data: Record<string, any>): string {
    const hashSource = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < hashSource.length; i++) {
      const char = hashSource.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return Math.abs(hash).toString(36);
  }
}
