// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PaginationControls } from "./index";

afterEach(() => {
  cleanup();
});

describe("PaginationControls", () => {
  it("前後ボタンでページ移動コールバックを呼べる", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<PaginationControls page={2} pageSize={10} total={25} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "前へ" }));
    await user.click(screen.getByRole("button", { name: "次へ" }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });

  it("境界ページでは無効化される", () => {
    const onPageChange = vi.fn();
    const { rerender } = render(
      <PaginationControls page={1} pageSize={10} total={5} onPageChange={onPageChange} />,
    );
    expect(screen.getByRole("button", { name: "前へ" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();

    rerender(<PaginationControls page={3} pageSize={10} total={25} onPageChange={onPageChange} />);
    expect(screen.getByRole("button", { name: "前へ" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
  });
});
