/**
 * Options 用: サービス設定一覧と Background へのメッセージ橋渡し。
 *
 * `exportServiceData` / `importServiceData` は Phase 5 の `data/export`・`data/import` を叩く。
 * 失敗理由は `getImportExportErrorMessage` で日本語化し、呼び出し側のトーストに載せる。
 */
import { create } from "zustand";
import { getImportExportErrorMessage } from "@/lib/import-export";
import type { ResponseMessage } from "@/lib/messages";
import type { ExportPayload, ImportPayload, ImportResult, ServiceConfig } from "@/lib/types";

/** インポート/エクスポートは `error` ストアではなく `errorMessage` で返し、二重トーストを避ける */
type StoreResult<T> = { ok: true; data: T } | { ok: false; errorMessage: string };

interface ServiceConfigStoreState {
  configs: ServiceConfig[];
  loading: boolean;
  error: string | null;
  fetchConfigs: () => Promise<void>;
  saveConfig: (config: ServiceConfig) => Promise<{ ok: true; configId: string } | { ok: false }>;
  deleteConfig: (
    id: string,
    deleteRecords?: boolean,
  ) => Promise<{ ok: true; deletedRecords: number } | { ok: false }>;
  /** Background 経由でエクスポート用ペイロードを取得（ファイル保存は UI 側）。 */
  exportServiceData: (serviceId: string) => Promise<StoreResult<ExportPayload>>;
  /** 検証済みペイロードを保存後、`configs/list` でストアを再同期する。 */
  importServiceData: (payload: ImportPayload) => Promise<StoreResult<ImportResult>>;
}

const getErrorMessage = (response: ResponseMessage<unknown>): string =>
  response.ok ? "" : response.error.message;

export const useServiceConfigStore = create<ServiceConfigStoreState>((set, get) => ({
  configs: [],
  loading: false,
  error: null,
  async fetchConfigs() {
    set({ loading: true, error: null });
    try {
      const response = await browser.runtime.sendMessage({
        type: "configs/list",
      });
      const typedResponse = response as ResponseMessage<{ configs: ServiceConfig[] }>;
      if (!typedResponse.ok) {
        set({ loading: false, error: getErrorMessage(typedResponse) });
        return;
      }
      set({ loading: false, configs: typedResponse.data.configs, error: null });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "unknown runtime error",
      });
    }
  },
  async saveConfig(config) {
    set({ loading: true, error: null });
    try {
      const response = await browser.runtime.sendMessage({
        type: "configs/save",
        payload: config,
      });
      const typedResponse = response as ResponseMessage<{ configId: string }>;
      if (!typedResponse.ok) {
        // 失敗通知は Options 側ハンドラの toast に任せ、ここでは error を立てない（二重トースト防止）
        set({ loading: false });
        return { ok: false };
      }

      const nextConfigs = [...get().configs];
      const existingIndex = nextConfigs.findIndex((item) => item.id === config.id);
      if (existingIndex === -1) {
        nextConfigs.push(config);
      } else {
        nextConfigs[existingIndex] = config;
      }
      set({ loading: false, configs: nextConfigs, error: null });
      return { ok: true, configId: typedResponse.data.configId };
    } catch (_error) {
      set({ loading: false });
      return { ok: false };
    }
  },
  async deleteConfig(id, deleteRecords = false) {
    set({ loading: true, error: null });
    try {
      const response = await browser.runtime.sendMessage({
        type: "configs/delete",
        payload: { id, deleteRecords },
      });
      const typedResponse = response as ResponseMessage<{ deletedRecords: number }>;
      if (!typedResponse.ok) {
        set({ loading: false });
        return { ok: false };
      }

      const nextConfigs = get().configs.filter((config) => config.id !== id);
      set({ loading: false, configs: nextConfigs, error: null });
      return { ok: true, deletedRecords: typedResponse.data.deletedRecords };
    } catch (_error) {
      set({ loading: false });
      return { ok: false };
    }
  },
  async exportServiceData(serviceId) {
    set({ loading: true, error: null });
    try {
      const response = await browser.runtime.sendMessage({
        type: "data/export",
        payload: { serviceId },
      });
      const typedResponse = response as ResponseMessage<ExportPayload>;
      if (!typedResponse.ok) {
        set({ loading: false });
        return {
          ok: false,
          errorMessage: getImportExportErrorMessage(typedResponse.error),
        };
      }

      set({ loading: false, error: null });
      return { ok: true, data: typedResponse.data };
    } catch (error) {
      set({ loading: false });
      return {
        ok: false,
        errorMessage: getImportExportErrorMessage(error),
      };
    }
  },
  async importServiceData(payload) {
    set({ loading: true, error: null });
    try {
      const response = await browser.runtime.sendMessage({
        type: "data/import",
        payload,
      });
      const typedResponse = response as ResponseMessage<ImportResult>;
      if (!typedResponse.ok) {
        set({ loading: false });
        return {
          ok: false,
          errorMessage: getImportExportErrorMessage(typedResponse.error),
        };
      }

      const configListResponse = await browser.runtime.sendMessage({
        type: "configs/list",
      });
      const typedConfigListResponse = configListResponse as ResponseMessage<{
        configs: ServiceConfig[];
      }>;
      if (typedConfigListResponse.ok) {
        set({
          configs: typedConfigListResponse.data.configs,
          loading: false,
          error: null,
        });
      } else {
        // インポート自体は成功しているため一覧取得失敗では error を立てず、次回表示で fetch すればよい
        set({ loading: false, error: null });
      }

      return { ok: true, data: typedResponse.data };
    } catch (error) {
      set({ loading: false });
      return {
        ok: false,
        errorMessage: getImportExportErrorMessage(error),
      };
    }
  },
}));
