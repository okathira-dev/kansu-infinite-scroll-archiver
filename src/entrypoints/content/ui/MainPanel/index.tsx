import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { useSearchStore, useServiceConfigStore } from "@/lib/stores";
import type { SearchQuery, ServiceConfig } from "@/lib/types";
import { matchesAnyUrlPattern } from "../../urlPatternMatcher";
import { PaginationControls } from "../PaginationControls";
import { RecordTable } from "../RecordTable";
import { SearchBar } from "../SearchBar";

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
      toast.info("設定変更を再取得しました");
    };
    window.addEventListener(CONFIGS_UPDATED_EVENT_NAME, handleConfigsUpdated);
    return () => window.removeEventListener(CONFIGS_UPDATED_EVENT_NAME, handleConfigsUpdated);
  }, [fetchConfigs]);

  useEffect(() => {
    if (error) {
      toast.error(`検索に失敗しました: ${error}`);
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
    <div id="kansu-main-panel">
      <Toaster richColors closeButton />
      <Card>
        <CardHeader className="gap-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Kansu アーカイブ検索</CardTitle>
            <Button
              id="kansu-close-panel"
              type="button"
              variant="outline"
              size="sm"
              onClick={onRequestClose}
            >
              閉じる
            </Button>
          </div>
          <CardDescription>
            Alt + ← / → でページ移動できます。検索条件は入力中に自動反映されます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {configs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              利用可能なサービス設定がありません。Options から設定を追加してください。
            </p>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="kansu-service-select">サービス</Label>
                <Select
                  value={query.serviceId}
                  items={configs.map((config) => ({ value: config.id, label: config.name }))}
                  onValueChange={handleConfigChange}
                >
                  <SelectTrigger id="kansu-service-select" className="w-full">
                    <SelectValue placeholder="サービスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {configs.map((config) => (
                      <SelectItem key={config.id} value={config.id}>
                        {config.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <SearchBar
                keyword={query.keyword}
                targetFieldNames={query.targetFieldNames}
                availableFieldNames={availableFieldNames}
                pageSize={query.pageSize}
                onKeywordChange={setKeyword}
                onToggleTargetField={handleToggleTargetField}
                onPageSizeChange={setPageSize}
              />

              <Separator />

              <RecordTable
                records={result.records}
                fieldNames={availableFieldNames}
                sortBy={query.sortBy}
                sortOrder={query.sortOrder}
                onSortBy={handleSortBy}
              />

              <PaginationControls
                page={query.page}
                pageSize={query.pageSize}
                total={result.total}
                onPageChange={setPage}
              />

              {loading && <p className="text-xs text-muted-foreground">検索中...</p>}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
