import { Toaster } from "@/components/ui/Toaster";

/** 保存通知を描画する View モジュールの入力。 */
export interface ArchiveSaveToastViewProps {
  serviceName: string;
  totalSaved: number;
  showIncrementCount: boolean;
  processed: number;
  created: number;
  updated: number;
}

/** 保存通知のタイトルを組み立てる。 */
export const buildArchiveSaveToastTitle = (serviceName: string): string => {
  const trimmedName = serviceName.trim();
  return trimmedName.length > 0
    ? `「${trimmedName}」のアーカイブを保存しました`
    : "アーカイブを保存しました";
};

/** 保存通知の説明文を組み立てる。 */
export const buildArchiveSaveToastDescription = ({
  totalSaved,
  showIncrementCount,
  created,
  updated,
  processed,
}: ArchiveSaveToastViewProps): string => {
  const totalLine = `保存済み合計 ${totalSaved} 件`;
  if (!showIncrementCount) {
    return totalLine;
  }
  return `${totalLine}\n新規 ${created} 件・更新 ${updated} 件（処理 ${processed} 件）`;
};

/** 保存サマリの表示本文を描画する View。 */
export function ArchiveSaveToastView(props: ArchiveSaveToastViewProps) {
  return (
    <div className="text-sm whitespace-pre-line">{buildArchiveSaveToastDescription(props)}</div>
  );
}

/** 保存通知用の Toaster を描画する View。 */
export function ArchiveSaveToastViewport() {
  return <Toaster richColors closeButton />;
}
