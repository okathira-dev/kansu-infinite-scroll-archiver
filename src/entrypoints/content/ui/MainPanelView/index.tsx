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
import type { SearchQuery, SearchResult, ServiceConfig } from "@/lib/types";
import { PaginationControls } from "../PaginationControls";
import { RecordTable } from "../RecordTable";
import { SearchBar } from "../SearchBar";

interface MainPanelViewProps {
  onRequestClose: () => void;
  configs: ServiceConfig[];
  query: SearchQuery;
  result: SearchResult;
  loading: boolean;
  availableFieldNames: string[];
  onConfigChange: (serviceId: string) => void;
  onKeywordChange: (keyword: string) => void;
  onToggleTargetField: (fieldName: string) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortBy: (fieldName: string) => void;
  onPageChange: (page: number) => void;
}

export function MainPanelView({
  onRequestClose,
  configs,
  query,
  result,
  loading,
  availableFieldNames,
  onConfigChange,
  onKeywordChange,
  onToggleTargetField,
  onPageSizeChange,
  onSortBy,
  onPageChange,
}: MainPanelViewProps) {
  return (
    <div id="kansu-main-panel">
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
                  onValueChange={onConfigChange}
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
                onKeywordChange={onKeywordChange}
                onToggleTargetField={onToggleTargetField}
                onPageSizeChange={onPageSizeChange}
              />

              <Separator />

              <RecordTable
                records={result.records}
                fieldNames={availableFieldNames}
                sortBy={query.sortBy}
                sortOrder={query.sortOrder}
                onSortBy={onSortBy}
              />

              <PaginationControls
                page={query.page}
                pageSize={query.pageSize}
                total={result.total}
                onPageChange={onPageChange}
              />

              {loading && <p className="text-xs text-muted-foreground">検索中...</p>}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
