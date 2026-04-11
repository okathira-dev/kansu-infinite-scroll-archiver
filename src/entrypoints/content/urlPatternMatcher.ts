/**
 * URL パターン（ワイルドカード `*`）を現在 URL に照合するユーティリティ。
 */
const wildcardToRegExp = (pattern: string): RegExp | null => {
  if (pattern.trim().length === 0) {
    return null;
  }

  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*");
  try {
    return new RegExp(`^${escaped}$`);
  } catch {
    return null;
  }
};

/**
 * 1 つの URL パターンと URL が一致するかを判定する。
 *
 * 不正パターンは例外にせず「非一致」として扱う。
 */
export const matchesUrlPattern = (urlPattern: string, url: string): boolean => {
  if (urlPattern === "<all_urls>") {
    return true;
  }

  const matcher = wildcardToRegExp(urlPattern);
  if (!matcher) {
    return false;
  }

  return matcher.test(url);
};

/** 複数パターンのうち 1 つでも一致したら true。 */
export const matchesAnyUrlPattern = (urlPatterns: string[], url: string): boolean =>
  urlPatterns.some((pattern) => matchesUrlPattern(pattern, url));
