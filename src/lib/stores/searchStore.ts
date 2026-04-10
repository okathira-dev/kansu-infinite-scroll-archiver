import { create } from "zustand";
import { recordDevPerformanceMetric } from "@/lib/dev/performanceMetrics";
import type { ResponseMessage } from "@/lib/messages";
import type { SearchQuery, SearchResult, SortOrder } from "@/lib/types";

interface SearchStoreState {
  query: SearchQuery;
  result: SearchResult;
  loading: boolean;
  error: string | null;
  setServiceId: (serviceId: string) => void;
  setKeyword: (keyword: string) => void;
  setTargetFieldNames: (targetFieldNames: string[]) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  search: () => Promise<boolean>;
  reset: (partialQuery?: Partial<SearchQuery>) => void;
}

const createDefaultQuery = (): SearchQuery => ({
  serviceId: "",
  keyword: "",
  targetFieldNames: [],
  sortBy: "",
  sortOrder: "asc",
  page: 1,
  pageSize: 10,
});

const defaultResult: SearchResult = { records: [], total: 0 };

/** デバウンス等で複数リクエストが重なったとき、最後に発行した検索だけが結果を反映する */
let searchRequestSequence = 0;

export const useSearchStore = create<SearchStoreState>((set, get) => ({
  query: createDefaultQuery(),
  result: defaultResult,
  loading: false,
  error: null,
  setServiceId(serviceId) {
    set((state) => ({
      query: {
        ...state.query,
        serviceId,
        page: 1,
      },
    }));
  },
  setKeyword(keyword) {
    set((state) => ({
      query: {
        ...state.query,
        keyword,
        page: 1,
      },
    }));
  },
  setTargetFieldNames(targetFieldNames) {
    set((state) => ({
      query: {
        ...state.query,
        targetFieldNames,
        page: 1,
      },
    }));
  },
  setSortBy(sortBy) {
    set((state) => ({
      query: {
        ...state.query,
        sortBy,
        page: 1,
      },
    }));
  },
  setSortOrder(sortOrder) {
    set((state) => ({
      query: {
        ...state.query,
        sortOrder,
      },
    }));
  },
  setPage(page) {
    set((state) => ({
      query: {
        ...state.query,
        page,
      },
    }));
  },
  setPageSize(pageSize) {
    set((state) => ({
      query: {
        ...state.query,
        pageSize,
        page: 1,
      },
    }));
  },
  async search() {
    const { query } = get();
    if (
      query.serviceId.trim().length === 0 ||
      query.sortBy.trim().length === 0 ||
      query.targetFieldNames.length === 0
    ) {
      set({
        result: defaultResult,
        error: null,
      });
      return false;
    }

    const requestId = ++searchRequestSequence;
    const startedAt = performance.now();
    set({ loading: true, error: null });
    try {
      const response = await browser.runtime.sendMessage({
        type: "records/search",
        payload: query,
      });
      if (requestId !== searchRequestSequence) {
        return false;
      }
      const typedResponse = response as ResponseMessage<SearchResult>;
      if (!typedResponse.ok) {
        recordDevPerformanceMetric("search-response", performance.now() - startedAt, {
          ok: false,
          serviceId: query.serviceId,
          reason: typedResponse.error.code,
        });
        set({
          loading: false,
          error: typedResponse.error.message,
        });
        return false;
      }
      recordDevPerformanceMetric("search-response", performance.now() - startedAt, {
        ok: true,
        serviceId: query.serviceId,
        keywordLength: query.keyword.length,
        total: typedResponse.data.total,
      });
      set({
        loading: false,
        error: null,
        result: typedResponse.data,
      });
      return true;
    } catch (error) {
      if (requestId !== searchRequestSequence) {
        return false;
      }
      recordDevPerformanceMetric("search-response", performance.now() - startedAt, {
        ok: false,
        serviceId: query.serviceId,
        reason: error instanceof Error ? error.message : "unknown runtime error",
      });
      set({
        loading: false,
        error: error instanceof Error ? error.message : "unknown runtime error",
      });
      return false;
    }
  },
  reset(partialQuery = {}) {
    set({
      query: {
        ...createDefaultQuery(),
        ...partialQuery,
      },
      result: defaultResult,
      loading: false,
      error: null,
    });
  },
}));
