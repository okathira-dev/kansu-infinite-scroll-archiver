const toHiragana = (value: string): string =>
  value.replace(/[\u30A1-\u30F6]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));

const collapseWhitespaces = (value: string): string => value.replace(/\s+/g, " ").trim();

/**
 * 検索向けに文字列を正規化する。
 *
 * - NFKC 正規化
 * - カタカナ → ひらがな fold
 * - 小文字化
 * - 空白の正規化
 */
export const normalizeForSearch = (value: string): string =>
  collapseWhitespaces(toHiragana(value.normalize("NFKC")).toLowerCase());

/** 複数フィールド値を結合して検索用テキストを生成する。 */
export const buildNormalizedSearchText = (values: string[]): string =>
  normalizeForSearch(values.filter((value) => value.trim().length > 0).join(" "));
