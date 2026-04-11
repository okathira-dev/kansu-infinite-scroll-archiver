/** E2E の waitForSelector / expect / poll 等の待ち上限（3 秒以下。flaky 時のみ見直す） */
export const E2E_STEP_TIMEOUT_MS = 3_000;

/** 抽出→保存→検索反映のようなバックグラウンド収束待ち専用の上限。 */
export const E2E_BACKGROUND_SYNC_TIMEOUT_MS = 6_000;
