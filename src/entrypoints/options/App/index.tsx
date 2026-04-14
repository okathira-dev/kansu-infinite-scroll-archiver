/**
 * Options 画面本体。アプリ設定タブの JSON インポート/エクスポートはファイル I/O をクライアントで行い、IndexedDB 更新は Background へ委譲する（Phase 5）。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortalContainerProvider,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  createExportFileName,
  downloadJsonText,
  getValidationIssueMessage,
  parseImportJsonText,
  stringifyExportPayload,
} from "@/lib/import-export";
import { useServiceConfigStore } from "@/lib/stores";
import type { FieldRule, FieldType, ServiceConfig } from "@/lib/types";
import { validateServiceConfig } from "@/lib/types";

interface EditableFieldRule extends FieldRule {
  uid: string;
}

interface ConfigEditorState {
  id: string;
  name: string;
  urlPatternsText: string;
  observeRootSelector: string;
  itemSelector: string;
  uniqueKeyField: string;
  enabled: boolean;
  fieldRules: EditableFieldRule[];
}

const FIELD_TYPE_OPTIONS: FieldType[] = ["text", "linkUrl", "imageUrl", "regex"];

const createUid = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `uid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const createDefaultEditorState = (): ConfigEditorState => ({
  id: "",
  name: "",
  urlPatternsText: "",
  observeRootSelector: "",
  itemSelector: "",
  uniqueKeyField: "title",
  enabled: true,
  fieldRules: [
    {
      uid: createUid(),
      name: "title",
      selector: ".title",
      type: "text",
    },
  ],
});

const toEditorState = (config: ServiceConfig): ConfigEditorState => ({
  id: config.id,
  name: config.name,
  urlPatternsText: config.urlPatterns.join("\n"),
  observeRootSelector: config.observeRootSelector,
  itemSelector: config.itemSelector,
  uniqueKeyField: config.uniqueKeyField,
  enabled: config.enabled,
  fieldRules: config.fieldRules.map((fieldRule) => ({
    ...fieldRule,
    uid: createUid(),
  })),
});

const toServiceConfig = (editor: ConfigEditorState): ServiceConfig => ({
  id: editor.id.trim().length > 0 ? editor.id.trim() : `service-${Date.now()}`,
  name: editor.name.trim(),
  urlPatterns: editor.urlPatternsText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0),
  observeRootSelector: editor.observeRootSelector.trim(),
  itemSelector: editor.itemSelector.trim(),
  uniqueKeyField:
    editor.uniqueKeyField.trim().length > 0
      ? editor.uniqueKeyField.trim()
      : (editor.fieldRules
          .map((fieldRule) => fieldRule.name.trim())
          .find((fieldName) => fieldName.length > 0) ?? ""),
  fieldRules: editor.fieldRules.map((fieldRule) => ({
    name: fieldRule.name.trim(),
    selector: fieldRule.selector.trim(),
    type: fieldRule.type,
    regex: fieldRule.type === "regex" ? fieldRule.regex?.trim() : undefined,
  })),
  enabled: editor.enabled,
  updatedAt: new Date().toISOString(),
});

function App() {
  const {
    configs,
    loading,
    error,
    fetchConfigs,
    saveConfig,
    deleteConfig,
    exportServiceData,
    importServiceData,
  } = useServiceConfigStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editor, setEditor] = useState<ConfigEditorState>(createDefaultEditorState);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [deleteDialogConfigId, setDeleteDialogConfigId] = useState<string | null>(null);
  const [deleteRecords, setDeleteRecords] = useState(false);
  const [selectedExportServiceId, setSelectedExportServiceId] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);
  /** 編集ダイアログ内 Select の Portal 先（body だと Dialog オーバーレイの下に隠れる）。 */
  const [configEditorSelectPortalRoot, setConfigEditorSelectPortalRoot] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    void fetchConfigs();
  }, [fetchConfigs]);

  useEffect(() => {
    if (error) {
      toast.error(`設定操作に失敗しました: ${error}`);
    }
  }, [error]);

  const sortedConfigs = useMemo(
    () =>
      [...configs].sort((left, right) => {
        return left.name.localeCompare(right.name, "ja", { numeric: true, sensitivity: "base" });
      }),
    [configs],
  );

  // エクスポート対象セレクト: 一覧が変わったら先頭へフォールバック（削除後の空 ID を防ぐ）
  useEffect(() => {
    if (sortedConfigs.length === 0) {
      setSelectedExportServiceId("");
      return;
    }

    setSelectedExportServiceId((previous) => {
      if (previous.length > 0 && sortedConfigs.some((config) => config.id === previous)) {
        return previous;
      }
      return sortedConfigs[0]?.id ?? "";
    });
  }, [sortedConfigs]);

  const handleNewConfig = () => {
    setEditingConfigId(null);
    setEditor(createDefaultEditorState());
    setIsEditorOpen(true);
  };

  const handleEditConfig = (config: ServiceConfig) => {
    setEditingConfigId(config.id);
    setEditor(toEditorState(config));
    setIsEditorOpen(true);
  };

  /** 設定編集ダイアログを閉じる（未保存の入力は破棄）。 */
  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingConfigId(null);
    setEditor(createDefaultEditorState());
  };

  const updateFieldRule = (
    uid: string,
    updater: (fieldRule: EditableFieldRule) => EditableFieldRule,
  ) => {
    setEditor((previous) => ({
      ...previous,
      fieldRules: previous.fieldRules.map((fieldRule) =>
        fieldRule.uid === uid ? updater(fieldRule) : fieldRule,
      ),
    }));
  };

  const handleSaveConfig = async () => {
    const config = toServiceConfig(editor);
    const validation = validateServiceConfig(config);
    if (!validation.ok) {
      const firstError = validation.errors[0];
      toast.error(`入力エラー: ${firstError?.field ?? "unknown"} ${firstError?.message ?? ""}`);
      return;
    }

    const response = await saveConfig(validation.data);
    if (!response.ok) {
      toast.error("設定の保存に失敗しました");
      return;
    }

    toast.success(editingConfigId ? "設定を更新しました" : "設定を追加しました");
    setIsEditorOpen(false);
    setEditingConfigId(null);
    setEditor(createDefaultEditorState());
  };

  const handleDeleteConfig = async () => {
    if (!deleteDialogConfigId) {
      return;
    }
    const response = await deleteConfig(deleteDialogConfigId, deleteRecords);
    if (!response.ok) {
      toast.error("設定の削除に失敗しました");
      return;
    }
    toast.success(
      deleteRecords
        ? `設定を削除しました（関連レコード ${response.deletedRecords} 件を削除）`
        : "設定を削除しました",
    );
    setDeleteDialogConfigId(null);
    setDeleteRecords(false);
  };

  /** `data/export` → ローカル JSON ダウンロード（`FR-40`）。 */
  const handleExportServiceData = async () => {
    if (selectedExportServiceId.length === 0) {
      toast.error("エクスポート対象のサービスを選択してください。");
      return;
    }

    const response = await exportServiceData(selectedExportServiceId);
    if (!response.ok) {
      toast.error(response.errorMessage);
      return;
    }

    const payload = response.data;
    const jsonText = stringifyExportPayload(payload);
    const fileName = createExportFileName(payload.service.id, payload.meta.exportedAt);
    downloadJsonText(fileName, jsonText);
    toast.success(`JSON をエクスポートしました（${payload.records.length} 件）。`);
  };

  /** ファイルを `parseImportJsonText` で検証してから `data/import`（`FR-41`/`FR-42`）。 */
  const handleImportServiceData = async () => {
    if (!importFile) {
      toast.error("インポートする JSON ファイルを選択してください。");
      return;
    }

    const fileText = await importFile.text();
    const parsedImport = parseImportJsonText(fileText);
    if (!parsedImport.ok) {
      toast.error(getValidationIssueMessage(parsedImport.errors));
      return;
    }

    const response = await importServiceData(parsedImport.data);
    if (!response.ok) {
      toast.error(response.errorMessage);
      return;
    }

    toast.success(
      `インポートしました（処理: ${response.data.imported} / 新規: ${response.data.created} / 更新: ${response.data.updated}）。`,
    );
    setImportFile(null);
    if (importFileInputRef.current) {
      importFileInputRef.current.value = "";
    }
  };

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <Toaster richColors closeButton />
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Kansu 設定</h1>
          <p className="text-sm text-muted-foreground">
            サービス設定の追加・編集・削除と、アプリ設定を管理します。
          </p>
        </header>

        <Tabs defaultValue="services">
          <TabsList>
            <TabsTrigger value="services">サービス設定</TabsTrigger>
            <TabsTrigger value="global">アプリ設定</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                登録済みサービス:{" "}
                <span className="font-medium text-foreground">{sortedConfigs.length}</span>
              </p>
              <Button id="new-config" type="button" onClick={handleNewConfig}>
                新しいサービス設定を追加
              </Button>
            </div>

            <Separator />

            {loading && <p className="text-sm text-muted-foreground">読み込み中...</p>}
            {!loading && sortedConfigs.length === 0 && (
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
              {sortedConfigs.map((config) => (
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleEditConfig(config)}
                      >
                        編集
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setDeleteDialogConfigId(config.id)}
                      >
                        削除
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="global">
            <div className="space-y-4">
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
                          items={sortedConfigs.map((config) => ({
                            value: config.id,
                            label: `${config.name} (${config.id})`,
                          }))}
                          onValueChange={setSelectedExportServiceId}
                        >
                          <SelectTrigger id="export-service-id" className="w-full">
                            <SelectValue placeholder="エクスポート対象を選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {sortedConfigs.map((config) => (
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
                        onClick={handleExportServiceData}
                        disabled={sortedConfigs.length === 0 || loading}
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
                            setImportFile(file);
                          }}
                        />
                      </div>
                      <Button
                        id="import-service-data"
                        type="button"
                        onClick={() => {
                          void handleImportServiceData();
                        }}
                        disabled={!importFile || loading}
                      >
                        JSON をインポート
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {importFile
                        ? `選択中: ${importFile.name}`
                        : "ファイル未選択（サービス設定 + 抽出データを含む JSON を指定）"}
                    </p>
                  </section>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">グローバル設定</CardTitle>
                  <CardDescription>
                    今後のフェーズで、デフォルトページサイズ等の共通設定を追加予定です。
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isEditorOpen} onOpenChange={(open) => !open && closeEditor()}>
        <DialogContent
          className="flex h-[min(92dvh,calc(100dvh-2rem))] max-h-[min(92dvh,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-7xl flex-col gap-0 overflow-hidden p-0 sm:max-w-7xl"
          disableOutsideDismiss
        >
          <SelectPortalContainerProvider value={configEditorSelectPortalRoot}>
            <div
              ref={setConfigEditorSelectPortalRoot}
              className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-6"
            >
              <DialogHeader>
                <DialogTitle>
                  {editingConfigId ? "サービス設定を編集" : "サービス設定を追加"}
                </DialogTitle>
                <DialogDescription>
                  抽出対象DOMのセレクタとフィールド抽出ルールを入力してください。
                </DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="grid gap-4 pb-2">
                  <div className="grid gap-2">
                    <Label htmlFor="config-name">表示名</Label>
                    <Input
                      id="config-name"
                      value={editor.name}
                      onChange={(event) =>
                        setEditor((previous) => ({
                          ...previous,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="config-id">ID</Label>
                    <Input
                      id="config-id"
                      value={editor.id}
                      onChange={(event) =>
                        setEditor((previous) => ({
                          ...previous,
                          id: event.target.value,
                        }))
                      }
                      placeholder="未入力時は自動採番"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="config-url-patterns">URL パターン（1行1件）</Label>
                    <Textarea
                      id="config-url-patterns"
                      value={editor.urlPatternsText}
                      onChange={(event) =>
                        setEditor((previous) => ({
                          ...previous,
                          urlPatternsText: event.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="config-observe-root">observeRootSelector</Label>
                      <Input
                        id="config-observe-root"
                        value={editor.observeRootSelector}
                        onChange={(event) =>
                          setEditor((previous) => ({
                            ...previous,
                            observeRootSelector: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="config-item-selector">itemSelector</Label>
                      <Input
                        id="config-item-selector"
                        value={editor.itemSelector}
                        onChange={(event) =>
                          setEditor((previous) => ({
                            ...previous,
                            itemSelector: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="config-unique-key">uniqueKeyField</Label>
                    <Select
                      value={editor.uniqueKeyField}
                      onValueChange={(value) =>
                        setEditor((previous) => ({
                          ...previous,
                          uniqueKeyField: value,
                        }))
                      }
                    >
                      <SelectTrigger id="config-unique-key" className="w-full">
                        <SelectValue placeholder="主キーにするフィールドを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {editor.fieldRules
                          .map((fieldRule) => fieldRule.name.trim())
                          .filter(
                            (name, index, names) =>
                              name.length > 0 && names.indexOf(name) === index,
                          )
                          .map((fieldName) => (
                            <SelectItem key={fieldName} value={fieldName}>
                              {fieldName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="config-enabled"
                      checked={editor.enabled}
                      onCheckedChange={(checked) =>
                        setEditor((previous) => ({
                          ...previous,
                          enabled: checked,
                        }))
                      }
                    />
                    <Label htmlFor="config-enabled">有効化</Label>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">fieldRules</h3>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setEditor((previous) => ({
                            ...previous,
                            fieldRules: [
                              ...previous.fieldRules,
                              {
                                uid: createUid(),
                                name: "",
                                selector: "",
                                type: "text",
                              },
                            ],
                          }))
                        }
                      >
                        フィールドを追加
                      </Button>
                    </div>

                    {editor.fieldRules.map((fieldRule, index) => (
                      <Card key={fieldRule.uid}>
                        <CardContent className="grid gap-2 pt-6">
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <Input
                              aria-label={`field-name-${index + 1}`}
                              placeholder="name"
                              value={fieldRule.name}
                              onChange={(event) =>
                                updateFieldRule(fieldRule.uid, (item) => ({
                                  ...item,
                                  name: event.target.value,
                                }))
                              }
                            />
                            <Input
                              aria-label={`field-selector-${index + 1}`}
                              placeholder="selector"
                              value={fieldRule.selector}
                              onChange={(event) =>
                                updateFieldRule(fieldRule.uid, (item) => ({
                                  ...item,
                                  selector: event.target.value,
                                }))
                              }
                            />
                            <Select
                              value={fieldRule.type}
                              onValueChange={(value) => {
                                if (!FIELD_TYPE_OPTIONS.includes(value as FieldType)) {
                                  return;
                                }
                                const nextType = value as FieldType;
                                updateFieldRule(fieldRule.uid, (item) => ({
                                  ...item,
                                  type: nextType,
                                  regex: nextType === "regex" ? (item.regex ?? "") : undefined,
                                }));
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FIELD_TYPE_OPTIONS.map((typeOption) => (
                                  <SelectItem key={typeOption} value={typeOption}>
                                    {typeOption}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {fieldRule.type === "regex" && (
                            <Input
                              aria-label={`field-regex-${index + 1}`}
                              placeholder="regex pattern"
                              value={fieldRule.regex ?? ""}
                              onChange={(event) =>
                                updateFieldRule(fieldRule.uid, (item) => ({
                                  ...item,
                                  regex: event.target.value,
                                }))
                              }
                            />
                          )}

                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() =>
                                setEditor((previous) => ({
                                  ...previous,
                                  fieldRules: previous.fieldRules.filter(
                                    (item) => item.uid !== fieldRule.uid,
                                  ),
                                }))
                              }
                              disabled={editor.fieldRules.length <= 1}
                            >
                              このフィールドを削除
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-auto shrink-0 border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={closeEditor}>
                  キャンセル
                </Button>
                <Button id="save-config" type="button" onClick={handleSaveConfig}>
                  保存
                </Button>
              </DialogFooter>
            </div>
          </SelectPortalContainerProvider>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogConfigId !== null}
        onOpenChange={(open) => !open && setDeleteDialogConfigId(null)}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>設定を削除しますか？</DialogTitle>
            <DialogDescription>
              この操作は取り消せません。必要なら関連レコードも同時に削除できます。
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Switch
              id="delete-records"
              checked={deleteRecords}
              onCheckedChange={setDeleteRecords}
            />
            <Label htmlFor="delete-records">関連レコードも削除する</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogConfigId(null)}>
              キャンセル
            </Button>
            <Button
              id="confirm-delete-config"
              type="button"
              variant="destructive"
              onClick={handleDeleteConfig}
            >
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default App;
