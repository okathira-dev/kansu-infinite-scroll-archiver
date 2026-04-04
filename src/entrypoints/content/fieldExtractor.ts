import type { FieldRule } from "@/lib/types";

const safeQuerySelector = (element: ParentNode, selector: string): Element | null => {
  try {
    return element.querySelector(selector);
  } catch {
    return null;
  }
};

const toAbsoluteUrl = (rawValue: string, pageUrl: string): string => {
  try {
    return new URL(rawValue, pageUrl).toString();
  } catch {
    return rawValue;
  }
};

/**
 * 1 フィールドの値を抽出する。失敗時は空文字を返す。
 */
export const extractFieldValue = (
  itemElement: ParentNode,
  fieldRule: FieldRule,
  pageUrl: string,
): string => {
  const targetElement = safeQuerySelector(itemElement, fieldRule.selector);
  if (!targetElement) {
    return "";
  }

  switch (fieldRule.type) {
    case "text":
      return targetElement.textContent?.trim() ?? "";
    case "linkUrl": {
      const href = targetElement.getAttribute("href")?.trim() ?? "";
      return href.length > 0 ? toAbsoluteUrl(href, pageUrl) : "";
    }
    case "imageUrl": {
      const src = targetElement.getAttribute("src")?.trim() ?? "";
      return src.length > 0 ? toAbsoluteUrl(src, pageUrl) : "";
    }
    case "regex": {
      if (!fieldRule.regex) {
        return "";
      }

      const sourceText = targetElement.textContent ?? "";
      try {
        const match = sourceText.match(new RegExp(fieldRule.regex));
        if (!match) {
          return "";
        }
        return (match[1] ?? match[0] ?? "").trim();
      } catch {
        return "";
      }
    }
    default:
      return "";
  }
};

/** item 要素からフィールド定義一式を抽出する。 */
export const extractFieldRawValues = (
  itemElement: ParentNode,
  fieldRules: FieldRule[],
  pageUrl: string,
): Record<string, string> => {
  const fieldRawValues: Record<string, string> = {};
  for (const fieldRule of fieldRules) {
    fieldRawValues[fieldRule.name] = extractFieldValue(itemElement, fieldRule, pageUrl);
  }
  return fieldRawValues;
};
