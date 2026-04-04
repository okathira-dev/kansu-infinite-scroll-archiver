import { describe, expect, it } from "vitest";
import { matchesAnyUrlPattern, matchesUrlPattern } from "./urlPatternMatcher";

describe("URL パターン一致判定", () => {
  it("ワイルドカードを含むパターンで一致できる", () => {
    expect(matchesUrlPattern("*://*.example.com/*", "https://news.example.com/articles/1")).toBe(
      true,
    );
  });

  it("一致しない URL は false になる", () => {
    expect(matchesUrlPattern("https://example.com/*", "https://other.example.com/")).toBe(false);
  });

  it("<all_urls> は常に一致する", () => {
    expect(matchesUrlPattern("<all_urls>", "https://any.site/path")).toBe(true);
  });

  it("複数パターンのいずれかに一致すれば true になる", () => {
    const patterns = ["https://foo.example/*", "*://bar.example/*"];
    expect(matchesAnyUrlPattern(patterns, "https://bar.example/list")).toBe(true);
  });

  it("ローカル fixture はポート番号をワイルドカードで任意にできる", () => {
    const pattern = "http://127.0.0.1:*/kansu-e2e/*";
    expect(matchesUrlPattern(pattern, "http://127.0.0.1:41731/kansu-e2e/infinite-scroll")).toBe(
      true,
    );
    expect(matchesUrlPattern(pattern, "http://127.0.0.1:41800/kansu-e2e/infinite-scroll")).toBe(
      true,
    );
    expect(matchesUrlPattern(pattern, "http://127.0.0.1:41731/other/path")).toBe(false);
  });
});
