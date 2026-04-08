// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ExtractedRecord } from "@/lib/types";
import { RecordTable } from "./index";

afterEach(() => {
  cleanup();
});

const records: ExtractedRecord[] = [
  {
    serviceId: "service-1",
    uniqueKey: "r1",
    extractedAt: "2026-04-05T00:00:00.000Z",
    fieldValues: {
      title: { raw: "タイトル1", normalized: "たいとる1" },
      link: { raw: "https://example.com/1", normalized: "https://example.com/1" },
    },
  },
];

describe("RecordTable", () => {
  it("レコードがない場合は空状態を表示する", () => {
    render(
      <RecordTable
        records={[]}
        fieldNames={["title"]}
        sortBy="title"
        sortOrder="asc"
        onSortBy={vi.fn()}
      />,
    );
    expect(screen.getByText("検索結果がありません")).toBeInTheDocument();
  });

  it("ソート見出しクリックで callback を呼ぶ", async () => {
    const user = userEvent.setup();
    const onSortBy = vi.fn();

    render(
      <RecordTable
        records={records}
        fieldNames={["title", "link"]}
        sortBy="title"
        sortOrder="asc"
        onSortBy={onSortBy}
      />,
    );

    await user.click(screen.getByRole("button", { name: "title" }));
    expect(onSortBy).toHaveBeenCalledWith("title");
    expect(screen.getByText("タイトル1")).toBeInTheDocument();
  });
});
