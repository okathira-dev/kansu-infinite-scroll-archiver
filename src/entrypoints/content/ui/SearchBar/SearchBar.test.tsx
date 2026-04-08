// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchBar } from "./index";

afterEach(() => {
  cleanup();
});

describe("SearchBar", () => {
  it("検索キーワード入力と対象フィールド切替を通知できる", async () => {
    const user = userEvent.setup();
    const onKeywordChange = vi.fn();
    const onToggleTargetField = vi.fn();

    const Wrapper = () => {
      const [keyword, setKeyword] = useState("");
      return (
        <SearchBar
          keyword={keyword}
          targetFieldNames={["title"]}
          pageSize={10}
          availableFieldNames={["title", "link"]}
          onKeywordChange={(value) => {
            setKeyword(value);
            onKeywordChange(value);
          }}
          onToggleTargetField={onToggleTargetField}
          onPageSizeChange={vi.fn()}
        />
      );
    };

    render(<Wrapper />);

    await user.type(screen.getByLabelText("キーワード検索"), "abc");
    expect(onKeywordChange).toHaveBeenLastCalledWith("abc");

    await user.click(screen.getByRole("button", { name: "title" }));
    expect(onToggleTargetField).toHaveBeenCalledWith("title");
  });
});
