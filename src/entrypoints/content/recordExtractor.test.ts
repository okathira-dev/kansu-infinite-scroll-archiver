import { describe, expect, it } from "vitest";
import { samplePageUrl, sampleServiceConfig } from "./fixtures";
import { extractRecordsFromDom } from "./recordExtractor";

type MockElement = {
  textContent: string | null;
  querySelector: (selector: string) => MockElement | null;
  querySelectorAll: (selector: string) => MockElement[];
  getAttribute: (name: string) => string | null;
};

const createLeafElement = (
  textContent: string,
  attributes: Record<string, string> = {},
): MockElement => ({
  textContent,
  querySelector: () => null,
  querySelectorAll: () => [],
  getAttribute: (name: string) => attributes[name] ?? null,
});

const createItemElement = (selectors: Record<string, MockElement>): MockElement => ({
  textContent: null,
  querySelector: (selector: string) => selectors[selector] ?? null,
  querySelectorAll: () => [],
  getAttribute: () => null,
});

const createRoot = (items: MockElement[]): ParentNode =>
  ({
    querySelectorAll: (selector: string) => (selector === ".item" ? items : []),
  }) as unknown as ParentNode;

describe("レコード抽出", () => {
  it("DOM 変化を模擬した再抽出で新規要素を取り込める", () => {
    const firstItem = createItemElement({
      ".id": createLeafElement("a1"),
      ".title": createLeafElement("記事 100"),
      ".link": createLeafElement("", { href: "/posts/a1" }),
      ".thumb": createLeafElement("", { src: "/images/a1.png" }),
    });
    const secondItem = createItemElement({
      ".id": createLeafElement("a2"),
      ".title": createLeafElement("記事 200"),
      ".link": createLeafElement("", { href: "/posts/a2" }),
      ".thumb": createLeafElement("", { src: "/images/a2.png" }),
    });

    const firstSnapshot = extractRecordsFromDom({
      config: sampleServiceConfig,
      observeRoot: createRoot([firstItem]),
      pageUrl: samplePageUrl,
    });
    const secondSnapshot = extractRecordsFromDom({
      config: sampleServiceConfig,
      observeRoot: createRoot([firstItem, secondItem]),
      pageUrl: samplePageUrl,
    });

    expect(firstSnapshot).toHaveLength(1);
    expect(secondSnapshot).toHaveLength(2);
    expect(secondSnapshot[1]?.uniqueKey).toBe("a2");
    expect(secondSnapshot[0]?.fieldValues.link?.raw).toBe("https://example.com/posts/a1");
    expect(secondSnapshot[0]?.fieldValues.thumbnail?.raw).toBe("https://example.com/images/a1.png");
    expect(secondSnapshot[0]?.fieldValues.digits?.raw).toBe("100");
  });

  it("主キー欠落や抽出失敗があっても安全にスキップできる", () => {
    const validItem = createItemElement({
      ".id": createLeafElement("ok-1"),
      ".title": createLeafElement("valid"),
      ".link": createLeafElement("", { href: "/valid" }),
      ".thumb": createLeafElement("", { src: "/valid.png" }),
    });
    const invalidItem = createItemElement({
      ".id": createLeafElement(""),
      ".title": createLeafElement("id が空"),
      ".link": createLeafElement(""),
      ".thumb": createLeafElement(""),
    });

    const records = extractRecordsFromDom({
      config: sampleServiceConfig,
      observeRoot: createRoot([validItem, invalidItem]),
      pageUrl: samplePageUrl,
    });

    expect(records).toHaveLength(1);
    expect(records[0]?.uniqueKey).toBe("ok-1");
    expect(records[0]?.fieldValues.id?.normalized.length).toBeGreaterThan(0);
  });
});
