import { describe, expect, it } from "vitest";
import { normalizeForSearch } from "./textNormalization";

describe("検索向け正規化", () => {
  it("NFKC と小文字化と空白畳みを適用する", () => {
    expect(normalizeForSearch(" ＡＢＣ　１２３  ")).toBe("abc 123");
  });

  it("半角カナと全角カナをひらがなへ統一する", () => {
    expect(normalizeForSearch("ｶﾀｶﾅ カタカナ")).toBe("かたかな かたかな");
  });

  it("英字はかなへ自動変換せず保持する", () => {
    expect(normalizeForSearch("Tokyo TOUKYOU")).toBe("tokyo toukyou");
  });

  it("長音記号は展開せずに保持する", () => {
    expect(normalizeForSearch("ラーメン")).toBe("らーめん");
  });

  it("結合文字を正規化したうえでひらがなへ統一する", () => {
    expect(normalizeForSearch("ダイエット")).toBe("だいえっと");
  });
});
