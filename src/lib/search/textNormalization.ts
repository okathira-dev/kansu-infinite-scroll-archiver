import { toHiragana } from "wanakana";

const collapseWhitespaces = (value: string): string => value.replace(/\s+/g, " ").trim();

/**
 * 検索向けに文字列を正規化する。
 *
 * - NFKC 正規化
 * - カタカナ → ひらがな fold（wanakana）
 * - 小文字化
 * - 空白の正規化
 */
export const normalizeForSearch = (value: string): string =>
  collapseWhitespaces(
    toHiragana(value.normalize("NFKC"), {
      // 英字をかなへ自動変換しない（検索語としての英単語を維持する）。
      passRomaji: true,
      // 長音記号の展開（オー→おう等）による過変換を避ける。
      convertLongVowelMark: false,
      useObsoleteKana: false,
    }).toLowerCase(),
  );
