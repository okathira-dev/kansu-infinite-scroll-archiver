import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TOGGLE_MAIN_UI_MESSAGE = {
  type: "kansu/toggleMainUi",
} as const;

function App() {
  const [status, setStatus] = useState<string>("待機中");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolveCandidateTabIds = async (): Promise<number[]> => {
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
    const tabs = await browser.tabs.query({ currentWindow: true });
    const ids = new Set<number>();
    if (typeof activeTab?.id === "number") {
      ids.add(activeTab.id);
    }
    for (const tab of tabs) {
      if (typeof tab.id === "number") {
        ids.add(tab.id);
      }
    }
    return [...ids];
  };

  const handleToggleMainUi = async () => {
    setIsSubmitting(true);
    setStatus("メインUIの切替を送信中...");
    try {
      const targetTabIds = await resolveCandidateTabIds();
      if (targetTabIds.length === 0) {
        setStatus("現在のタブを取得できませんでした");
        return;
      }

      let sent = false;
      for (const targetTabId of targetTabIds) {
        try {
          await browser.tabs.sendMessage(targetTabId, TOGGLE_MAIN_UI_MESSAGE);
          sent = true;
          break;
        } catch {
          // コンテントスクリプト未注入タブでは送信エラーになるため、次候補へフォールバックする。
        }
      }

      if (!sent) {
        setStatus("メインUI切替の送信先タブが見つかりませんでした");
        return;
      }

      setStatus("メインUIの表示切替を送信しました");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `送信に失敗しました: ${error.message}`
          : "送信に失敗しました: unknown error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenOptions = async () => {
    try {
      await browser.runtime.openOptionsPage();
      setStatus("Optionsページを開きました");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `Optionsページを開けませんでした: ${error.message}`
          : "Optionsページを開けませんでした: unknown error",
      );
    }
  };

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
            onClick={handleToggleMainUi}
            disabled={isSubmitting}
          >
            メインUIを切り替える
          </Button>
          <Button
            id="open-options"
            className="w-full"
            type="button"
            variant="outline"
            onClick={handleOpenOptions}
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

export default App;
