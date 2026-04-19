import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface PopupAppViewProps {
  status: string;
  isSubmitting: boolean;
  onToggleMainUi: () => void;
  onOpenOptions: () => void;
}

/** Popup の表示を担う View モジュール。 */
export function PopupAppView({
  status,
  isSubmitting,
  onToggleMainUi,
  onOpenOptions,
}: PopupAppViewProps) {
  return (
    <main className="w-72 p-3 bg-background">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">Kansu</CardTitle>
          <CardDescription>現在タブでメインUIの表示を切り替えます。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            id="toggle-main-ui"
            className="w-full"
            type="button"
            onClick={onToggleMainUi}
            disabled={isSubmitting}
          >
            メインUIを切り替える
          </Button>
          <Button
            id="open-options"
            className="w-full"
            type="button"
            variant="outline"
            onClick={onOpenOptions}
          >
            設定を開く
          </Button>
          <p id="popup-status" className="text-xs text-muted-foreground" aria-live="polite">
            {status}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
