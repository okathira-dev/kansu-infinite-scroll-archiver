/**
 * Test setup file
 * テスト環境の初期化設定
 */

// IndexedDBのモック設定（auto import により自動的にグローバルに設定される）
import "fake-indexeddb/auto";

// テスト環境であることを示すフラグ
process.env.NODE_ENV = "test";

// WXT Testing Frameworkを使用
// 独自のブラウザAPIモック設定は削除し、WXTのfakeBrowserに統一
