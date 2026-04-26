import { describe, expect, it } from "vitest";
import { formatStorageBytesLabel } from "./extensionStorageEstimate";

describe("formatStorageBytesLabel", () => {
  it("null や不正値はダッシュを返す", () => {
    expect(formatStorageBytesLabel(null)).toBe("—");
    expect(formatStorageBytesLabel(Number.NaN)).toBe("—");
    expect(formatStorageBytesLabel(-1)).toBe("—");
  });

  it("バイト単位で整形する", () => {
    expect(formatStorageBytesLabel(0)).toBe("0 B");
    expect(formatStorageBytesLabel(1023)).toBe("1023 B");
  });

  it("KB 以上は KB 表記にする", () => {
    expect(formatStorageBytesLabel(1024)).toBe("1 KB");
    expect(formatStorageBytesLabel(2048)).toBe("2 KB");
    expect(formatStorageBytesLabel(1536)).toBe("1.5 KB");
  });

  it("MB 以上は MB 表記にする", () => {
    expect(formatStorageBytesLabel(1024 * 1024)).toBe("1 MB");
    expect(formatStorageBytesLabel(5 * 1024 * 1024)).toBe("5 MB");
    expect(formatStorageBytesLabel(15 * 1024 * 1024)).toBe("15 MB");
  });
});
