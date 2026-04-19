import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ServiceConfig } from "@/lib/types";

export interface ServiceConfigsSectionViewProps {
  loading: boolean;
  configs: ServiceConfig[];
  onCreateConfig: () => void;
  onEditConfig: (config: ServiceConfig) => void;
  onRequestDeleteConfig: (configId: string) => void;
}

/** 設定一覧タブの表示を担う View モジュール。 */
export function ServiceConfigsSectionView({
  loading,
  configs,
  onCreateConfig,
  onEditConfig,
  onRequestDeleteConfig,
}: ServiceConfigsSectionViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          登録済みサービス: <span className="font-medium text-foreground">{configs.length}</span>
        </p>
        <Button id="new-config" type="button" onClick={onCreateConfig}>
          新しいサービス設定を追加
        </Button>
      </div>

      <Separator />

      {loading && <p className="text-sm text-muted-foreground">読み込み中...</p>}
      {!loading && configs.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">設定がありません</CardTitle>
            <CardDescription>
              「新しいサービス設定を追加」から最初の設定を作成してください。
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-3">
        {configs.map((config) => (
          <Card key={config.id}>
            <CardHeader className="gap-1">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{config.name}</CardTitle>
                <Badge variant={config.enabled ? "default" : "secondary"}>
                  {config.enabled ? "有効" : "無効"}
                </Badge>
              </div>
              <CardDescription>
                ID: <code>{config.id}</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                URLパターン: {config.urlPatterns.join(", ")}
              </p>
              <p className="text-sm text-muted-foreground">
                フィールド数: {config.fieldRules.length} / 主キー: {config.uniqueKeyField}
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onEditConfig(config)}>
                  編集
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onRequestDeleteConfig(config.id)}
                >
                  削除
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
