// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const { fetchConfigsMock, saveConfigMock, deleteConfigMock } = vi.hoisted(() => ({
  fetchConfigsMock: vi.fn(async () => {}),
  saveConfigMock: vi.fn(async () => ({ ok: true as const, configId: "service-1" })),
  deleteConfigMock: vi.fn(async () => ({ ok: true as const, deletedRecords: 0 })),
}));

vi.mock("@/lib/stores", () => ({
  useServiceConfigStore: () => ({
    configs: [],
    loading: false,
    error: null,
    fetchConfigs: fetchConfigsMock,
    saveConfig: saveConfigMock,
    deleteConfig: deleteConfigMock,
  }),
}));

afterEach(() => {
  cleanup();
});

describe("Options App", () => {
  it("新規設定ボタンでフォームダイアログを開ける", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText("設定がありません")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "新しいサービス設定を追加" }));
    expect(screen.getByRole("heading", { name: "サービス設定を追加" })).toBeInTheDocument();
  });
});
