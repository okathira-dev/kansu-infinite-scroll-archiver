import { create } from "zustand";
import type { ResponseMessage } from "@/lib/messages";
import type { ServiceConfig } from "@/lib/types";

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
        set({ loading: false, error: getErrorMessage(typedResponse) });
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
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "unknown runtime error",
      });
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
        set({ loading: false, error: getErrorMessage(typedResponse) });
        return { ok: false };
      }

      const nextConfigs = get().configs.filter((config) => config.id !== id);
      set({ loading: false, configs: nextConfigs, error: null });
      return { ok: true, deletedRecords: typedResponse.data.deletedRecords };
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "unknown runtime error",
      });
      return { ok: false };
    }
  },
}));
