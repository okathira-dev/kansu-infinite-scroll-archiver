import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { ServiceConfig } from "@/lib/types";

export interface DataTransferSectionViewProps {
  configs: ServiceConfig[];
  selectedExportServiceId: string;
  importFileName: string | null;
  loading: boolean;
  importFileInputRef?: RefObject<HTMLInputElement | null>;
  onSelectExportService: (serviceId: string) => void;
  onSelectImportFile: (file: File | null) => void;
  onExport: () => void;
  onImport: () => void;
}

/** JSON 入出力カードの表示を担う View モジュール。 */
export function DataTransferSectionView({
  configs,
  selectedExportServiceId,
  importFileName,
  loading,
  importFileInputRef,
  onSelectExportService,
  onSelectImportFile,
  onExport,
  onImport,
}: DataTransferSectionViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">データ管理（JSON）</CardTitle>
        <CardDescription>
          サービス単位で、設定と抽出データをエクスポート・インポートできます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-2">
          <h3 className="text-sm font-medium">エクスポート</h3>
          <p className="text-sm text-muted-foreground">
            対象サービスを選択して JSON をダウンロードします。
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="grid gap-2">
              <Label htmlFor="export-service-id">サービス</Label>
              <Select
                value={selectedExportServiceId}
                items={configs.map((config) => ({
                  value: config.id,
                  label: `${config.name} (${config.id})`,
                }))}
                onValueChange={onSelectExportService}
              >
                <SelectTrigger id="export-service-id" className="w-full">
                  <SelectValue placeholder="エクスポート対象を選択" />
                </SelectTrigger>
                <SelectContent>
                  {configs.map((config) => (
                    <SelectItem key={config.id} value={config.id}>
                      {config.name} ({config.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              id="export-service-data"
              type="button"
              onClick={onExport}
              disabled={configs.length === 0 || loading}
            >
              JSON をエクスポート
            </Button>
          </div>
        </section>

        <Separator />

        <section className="space-y-2">
          <h3 className="text-sm font-medium">インポート</h3>
          <p className="text-sm text-muted-foreground">
            `schemaVersion` と必須項目を検証してから反映します。
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="grid gap-2">
              <Label htmlFor="import-json-file">JSON ファイル</Label>
              <Input
                ref={importFileInputRef}
                id="import-json-file"
                type="file"
                accept=".json,application/json"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  onSelectImportFile(file);
                }}
              />
            </div>
            <Button
              id="import-service-data"
              type="button"
              onClick={onImport}
              disabled={!importFileName || loading}
            >
              JSON をインポート
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {importFileName
              ? `選択中: ${importFileName}`
              : "ファイル未選択（サービス設定 + 抽出データを含む JSON を指定）"}
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
