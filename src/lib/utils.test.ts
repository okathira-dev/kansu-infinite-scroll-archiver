import { describe, expect, it } from "vitest";
import { add } from "./utils";

describe("add 関数", () => {
  it("2つの数値を加算できる", () => {
    expect(add(2, 3)).toBe(5);
  });
});
