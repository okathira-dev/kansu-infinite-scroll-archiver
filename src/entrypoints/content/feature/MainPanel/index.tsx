import { useEffect, useMemo } from "react";
import { notifyError, notifyInfo } from "@/components/ui/Toaster";
import { useSearchStore, useServiceConfigStore } from "@/lib/stores";
import type { SearchQuery, ServiceConfig } from "@/lib/types";
import { MainPanelView } from "../../ui/MainPanelView";
import { matchesAnyUrlPattern } from "../../urlPatternMatcher";

const CONFIGS_UPDATED_EVENT_NAME = "kansu:configs-updated";

interface MainPanelProps {
  onRequestClose: () => void;
}

const findInitialConfig = (configs: ServiceConfig[]): ServiceConfig | null => {
  const enabledConfigs = configs.filter((config) => config.enabled);
  if (enabledConfigs.length === 0) {
    return null;
  }
  return (
    enabledConfigs.find((config) =>
      matchesAnyUrlPattern(config.urlPatterns, window.location.href),
    ) ??
    enabledConfigs[0] ??
    null
  );
};

const buildDefaultQueryFromConfig = (config: ServiceConfig): Partial<SearchQuery> => {
  const fieldNames = config.fieldRules
    .map((fieldRule) => fieldRule.name)
    .filter((name) => name.length > 0);
  return {
    serviceId: config.id,
    keyword: "",
    targetFieldNames: fieldNames,
    sortBy: fieldNames[0] ?? "",
    sortOrder: "asc",
    page: 1,
    pageSize: 10,
  };
};

export function MainPanel({ onRequestClose }: MainPanelProps) {
  const { configs, fetchConfigs } = useServiceConfigStore();
  const {
    query,
    result,
    loading,
    error,
    reset,
    search,
    setKeyword,
    setTargetFieldNames,
    setSortBy,
    setSortOrder,
    setPage,
    setPageSize,
  } = useSearchStore();

  const activeConfig = useMemo(
    () => configs.find((config) => config.id === query.serviceId) ?? null,
    [configs, query.serviceId],
  );
  const availableFieldNames = useMemo(
    () =>
      activeConfig?.fieldRules
        .map((fieldRule) => fieldRule.name)
        .filter((name) => name.length > 0) ?? [],
    [activeConfig],
  );

  useEffect(() => {
    void fetchConfigs();
  }, [fetchConfigs]);

  useEffect(() => {
    const handleConfigsUpdated = () => {
      void fetchConfigs();
      notifyInfo("設定変更を再取得しました");
    };
    window.addEventListener(CONFIGS_UPDATED_EVENT_NAME, handleConfigsUpdated);
    return () => window.removeEventListener(CONFIGS_UPDATED_EVENT_NAME, handleConfigsUpdated);
  }, [fetchConfigs]);

  useEffect(() => {
    if (error) {
      notifyError(`検索に失敗しました: ${error}`);
    }
  }, [error]);

  useEffect(() => {
    const initialConfig = findInitialConfig(configs);
    if (!initialConfig) {
      return;
    }
    if (query.serviceId === initialConfig.id) {
      return;
    }
    reset(buildDefaultQueryFromConfig(initialConfig));
  }, [configs, query.serviceId, reset]);

  useEffect(() => {
    if (
      query.serviceId.trim().length === 0 ||
      query.sortBy.trim().length === 0 ||
      query.targetFieldNames.length === 0
    ) {
      void search();
      return;
    }
    const timerId = window.setTimeout(() => {
      void search();
    }, 300);
    return () => window.clearTimeout(timerId);
  }, [query, search]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!event.altKey) {
        return;
      }
      const totalPages = Math.max(1, Math.ceil(result.total / query.pageSize));
      if (event.key === "ArrowLeft" && query.page > 1) {
        event.preventDefault();
        setPage(query.page - 1);
      }
      if (event.key === "ArrowRight" && query.page < totalPages) {
        event.preventDefault();
        setPage(query.page + 1);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [query.page, query.pageSize, result.total, setPage]);

  const handleConfigChange = (serviceId: string) => {
    const nextConfig = configs.find((config) => config.id === serviceId);
    if (!nextConfig) {
      return;
    }
    reset(buildDefaultQueryFromConfig(nextConfig));
  };

  const handleToggleTargetField = (fieldName: string) => {
    const selected = query.targetFieldNames.includes(fieldName);
    if (selected) {
      const next = query.targetFieldNames.filter((name) => name !== fieldName);
      setTargetFieldNames(next);
      return;
    }
    setTargetFieldNames([...query.targetFieldNames, fieldName]);
  };

  const handleSortBy = (fieldName: string) => {
    if (query.sortBy === fieldName) {
      setSortOrder(query.sortOrder === "asc" ? "desc" : "asc");
      return;
    }
    setSortBy(fieldName);
    setSortOrder("asc");
  };

  return (
    <MainPanelView
      onRequestClose={onRequestClose}
      configs={configs}
      query={query}
      result={result}
      loading={loading}
      availableFieldNames={availableFieldNames}
      onConfigChange={handleConfigChange}
      onKeywordChange={setKeyword}
      onToggleTargetField={handleToggleTargetField}
      onPageSizeChange={setPageSize}
      onSortBy={handleSortBy}
      onPageChange={setPage}
    />
  );
}
