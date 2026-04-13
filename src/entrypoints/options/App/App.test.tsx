// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SUPPORTED_SCHEMA_VERSION } from "@/lib/import-export/schemaVersion";
import type { ServiceConfig } from "@/lib/types";
import App from "./index";

const {
  fetchConfigsMock,
  saveConfigMock,
  deleteConfigMock,
  exportServiceDataMock,
  importServiceDataMock,
  storeState,
} = vi.hoisted(() => ({
  fetchConfigsMock: vi.fn(async () => {}),
  saveConfigMock: vi.fn(async () => ({ ok: true as const, configId: "service-1" })),
  deleteConfigMock: vi.fn(async () => ({ ok: true as const, deletedRecords: 0 })),
  exportServiceDataMock: vi.fn(
    async () =>
      ({
        ok: true as const,
        data: {
          schemaVersion: SUPPORTED_SCHEMA_VERSION,
          service: {
            id: "service-1",
            name: "Service 1",
            urlPatterns: ["*://example.com/*"],
            observeRootSelector: "body",
            itemSelector: ".item",
            uniqueKeyField: "id",
            fieldRules: [{ name: "id", selector: ".id", type: "text" as const }],
            enabled: true,
            updatedAt: "2026-04-09T00:00:00.000Z",
          },
          records: [],
          meta: { exportedAt: "2026-04-09T00:00:00.000Z" },
        },
      }) as const,
  ),
  importServiceDataMock: vi.fn(
    async () =>
      ({
        ok: true as const,
        data: { serviceId: "service-1", imported: 1, created: 1, updated: 0 },
      }) as const,
  ),
  storeState: {
    configs: [] as ServiceConfig[],
  },
}));

vi.mock("@/lib/stores", () => ({
  useServiceConfigStore: () => ({
    configs: storeState.configs,
    loading: false,
    error: null,
    fetchConfigs: fetchConfigsMock,
    saveConfig: saveConfigMock,
    deleteConfig: deleteConfigMock,
    exportServiceData: exportServiceDataMock,
    importServiceData: importServiceDataMock,
  }),
}));

beforeEach(() => {
  storeState.configs = [];
  fetchConfigsMock.mockClear();
  saveConfigMock.mockClear();
  deleteConfigMock.mockClear();
  exportServiceDataMock.mockClear();
  importServiceDataMock.mockClear();
});

afterEach(() => {
  cleanup();
});

describe("Options App", () => {
  it("新規設定ボタンで編集ダイアログを開ける", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText("設定がありません")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "新しいサービス設定を追加" }));
    expect(screen.getByRole("heading", { name: "サービス設定を追加" })).toBeInTheDocument();
  });

  it("データ管理タブでサービス単位エクスポートを実行できる", async () => {
    const user = userEvent.setup();
    storeState.configs = [
      {
        id: "service-1",
        name: "Service 1",
        urlPatterns: ["*://example.com/*"],
        observeRootSelector: "body",
        itemSelector: ".item",
        uniqueKeyField: "id",
        fieldRules: [{ name: "id", selector: ".id", type: "text" }],
        enabled: true,
        updatedAt: "2026-04-09T00:00:00.000Z",
      },
    ];

    render(<App />);

    await user.click(screen.getByRole("tab", { name: "アプリ設定" }));
    await user.click(screen.getByRole("button", { name: "JSON をエクスポート" }));

    expect(exportServiceDataMock).toHaveBeenCalledWith("service-1");
  });
});
