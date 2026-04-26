/**
 * 拡張オリジンの `navigator.storage.estimate()` からストレージ使用量の目安を取得する。
 *
 * 値はブラウザ実装依存の近似であり、IndexedDB のキー単位の実バイトは取得できない。
 */

/** `navigator.storage.estimate()` から取り出した表示用の目安。 */
export interface ExtensionStorageEstimate {
  /** オリジンに割り当てられたクォータ（バイト）。取得できない場合は null。 */
  quotaBytes: number | null;
  /** オリジン全体の使用量（バイト）。取得できない場合は null。 */
  usageBytes: number | null;
  /**
   * Chromium 系で `usageDetails.indexedDB` が取れる場合のみ。
   * それ以外のブラウザでは null。
   */
  indexedDbBytes: number | null;
}

/**
 * 拡張ページ（Options 等）から呼び出し、ストレージ使用量の目安を返す。
 */
export async function getExtensionStorageEstimate(): Promise<ExtensionStorageEstimate> {
  if (typeof navigator === "undefined" || typeof navigator.storage?.estimate !== "function") {
    return { quotaBytes: null, usageBytes: null, indexedDbBytes: null };
  }

  try {
    /** Chromium が `usageDetails` を付与する場合がある（型定義に未反映のことがある）。 */
    const estimate = (await navigator.storage.estimate()) as StorageEstimate & {
      usageDetails?: Record<string, number>;
    };
    const usageDetails = estimate.usageDetails;
    const indexedDbBytes =
      usageDetails !== undefined && typeof usageDetails.indexedDB === "number"
        ? usageDetails.indexedDB
        : null;

    return {
      quotaBytes: typeof estimate.quota === "number" ? estimate.quota : null,
      usageBytes: typeof estimate.usage === "number" ? estimate.usage : null,
      indexedDbBytes,
    };
  } catch {
    return { quotaBytes: null, usageBytes: null, indexedDbBytes: null };
  }
}

/** 設定画面のストレージ表示向けにバイト数を整形する。 */
export function formatStorageBytesLabel(bytes: number | null): string {
  if (bytes === null || !Number.isFinite(bytes) || bytes < 0) {
    return "—";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    const label = kb >= 10 ? kb.toFixed(0) : kb.toFixed(1);
    return `${label.replace(/\.0$/, "")} KB`;
  }
  const mb = bytes / (1024 * 1024);
  const mbLabel = mb >= 10 ? mb.toFixed(0) : mb.toFixed(1);
  return `${mbLabel.replace(/\.0$/, "")} MB`;
}
