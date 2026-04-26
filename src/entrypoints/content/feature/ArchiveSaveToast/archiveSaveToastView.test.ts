import { describe, expect, it } from "vitest";
import {
  type ArchiveSaveToastViewProps,
  buildArchiveSaveToastDescription,
  buildArchiveSaveToastTitle,
} from "./ArchiveSaveToastView";

const baseProps = (): ArchiveSaveToastViewProps => ({
  serviceName: "Demo",
  totalSaved: 24,
  showIncrementCount: true,
  processed: 5,
  created: 2,
  updated: 3,
});

describe("buildArchiveSaveToastTitle", () => {
  it("サービス名がある場合はサービス名入りタイトルを返す", () => {
    expect(buildArchiveSaveToastTitle("Demo")).toBe("「Demo」のアーカイブを保存しました");
  });

  it("サービス名が空白のみなら汎用タイトルを返す", () => {
    expect(buildArchiveSaveToastTitle("   ")).toBe("アーカイブを保存しました");
  });
});

describe("buildArchiveSaveToastDescription", () => {
  it("内訳オン時は増分内訳を含む", () => {
    expect(buildArchiveSaveToastDescription(baseProps())).toBe(
      "保存済み合計 24 件\n新規 2 件・更新 3 件（処理 5 件）",
    );
  });

  it("内訳オフ時は保存合計のみ返す", () => {
    expect(buildArchiveSaveToastDescription({ ...baseProps(), showIncrementCount: false })).toBe(
      "保存済み合計 24 件",
    );
  });
});
