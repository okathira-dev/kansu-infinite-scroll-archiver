import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ExtensionStorageEstimate,
  formatStorageBytesLabel,
} from "@/lib/storage/extensionStorageEstimate";
import type { ServiceConfig } from "@/lib/types";

export interface StorageOverviewSectionViewProps {
  storageLoading: boolean;
  storageError: string | null;
  storageEstimate: ExtensionStorageEstimate | null;
  countsByServiceId: Record<string, number> | null;
  configs: ServiceConfig[];
  orphanRecordServiceIds: string[];
  onReload: () => void;
}

/** ストレージ概要タブの表示を担う View モジュール。 */
export function StorageOverviewSectionView({
  storageLoading,
  storageError,
  storageEstimate,
  countsByServiceId,
  configs,
  orphanRecordServiceIds,
  onReload,
}: StorageOverviewSectionViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          ブラウザが報告するストレージ使用量の目安と、サービス別の保存件数です。
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={storageLoading}
          onClick={onReload}
        >
          再読み込み
        </Button>
      </div>

      {storageLoading && <p className="text-sm text-muted-foreground">読み込み中...</p>}
      {storageError && (
        <p className="text-sm text-destructive" role="alert">
          取得に失敗しました: {storageError}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">IndexedDB の使用量（目安）</CardTitle>
          <CardDescription>
            値は実装依存の近似です。オリジン全体の合計に近く、サービス別のバイト数は取得できません。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex flex-wrap justify-between gap-2 border-b border-border py-2">
            <span className="text-muted-foreground">オリジン全体の使用量</span>
            <span className="font-medium tabular-nums">
              {formatStorageBytesLabel(storageEstimate?.usageBytes ?? null)}
            </span>
          </div>
          <div className="flex flex-wrap justify-between gap-2 border-b border-border py-2">
            <span className="text-muted-foreground">IndexedDB（内訳が取れる環境のみ）</span>
            <span className="font-medium tabular-nums">
              {formatStorageBytesLabel(storageEstimate?.indexedDbBytes ?? null)}
            </span>
          </div>
          <div className="flex flex-wrap justify-between gap-2 py-2">
            <span className="text-muted-foreground">ストレージクォータ（目安）</span>
            <span className="font-medium tabular-nums">
              {formatStorageBytesLabel(storageEstimate?.quotaBytes ?? null)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">サービス別の保存件数</CardTitle>
          <CardDescription>
            登録済みサービスごとのレコード件数（IndexedDB 上の実数）です。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <p className="text-sm text-muted-foreground">サービス設定がありません。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>表示名</TableHead>
                  <TableHead>サービス ID</TableHead>
                  <TableHead className="text-right">保存件数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium">{config.name}</TableCell>
                    <TableCell>
                      <code className="text-xs">{config.id}</code>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {countsByServiceId !== null ? (countsByServiceId[config.id] ?? 0) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {orphanRecordServiceIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">設定にないサービス ID のレコード</CardTitle>
            <CardDescription>
              設定を削除したあとも IndexedDB に残っている場合に表示されます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>サービス ID</TableHead>
                  <TableHead className="text-right">保存件数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orphanRecordServiceIds.map((serviceId) => (
                  <TableRow key={serviceId}>
                    <TableCell>
                      <code className="text-xs">{serviceId}</code>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {countsByServiceId?.[serviceId] ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
