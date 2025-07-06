import { Download, RefreshCw, Settings, Trash2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { Toast, ToastDescription, ToastTitle } from "@/components/ui/toast";
import type { ExtractedData } from "@/lib/types";
import { cn } from "@/lib/utils";

// Chrome API type declarations
interface ChromeMessage {
  type: string;
  data?: unknown;
}

interface ChromeResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

declare global {
  const chrome: {
    runtime: {
      sendMessage: (message: ChromeMessage) => Promise<ChromeResponse>;
    };
  };
}

interface MainUIProps {
  className?: string;
  onClose?: () => void;
}

interface ToastState {
  isVisible: boolean;
  variant: "default" | "success" | "warning" | "info" | "destructive";
  title: string;
  description: string;
}

function MainUI({ className, onClose }: MainUIProps) {
  const [data, setData] = React.useState<ExtractedData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteModal, setDeleteModal] = React.useState<{
    isOpen: boolean;
    item: ExtractedData | null;
  }>({
    isOpen: false,
    item: null,
  });
  const [toast, setToast] = React.useState<ToastState>({
    isVisible: false,
    variant: "default",
    title: "",
    description: "",
  });

  const showToast = (variant: ToastState["variant"], title: string, description: string) => {
    setToast({
      isVisible: true,
      variant,
      title,
      description,
    });
  };

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      // Use browser API to get data from background service
      const response = await chrome.runtime.sendMessage({
        type: "SEARCH_DATA",
        data: { query: "", limit: 1000, offset: 0 },
      });

      if (response.success) {
        setData((response.data as ExtractedData[]) || []);
      } else {
        setToast({
          isVisible: true,
          variant: "destructive",
          title: "Error",
          description: "Failed to load data",
        });
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      setToast({
        isVisible: true,
        variant: "destructive",
        title: "Error",
        description: "Failed to load data",
      });
      // Fallback to empty data for development
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount
  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const handleDeleteClick = (item: ExtractedData) => {
    setDeleteModal({ isOpen: true, item });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;

    try {
      const response = await chrome.runtime.sendMessage({
        type: "DELETE_DATA",
        data: { id: deleteModal.item.id },
      });

      if (response.success) {
        setData((prev) => prev.filter((item) => item.id !== deleteModal.item?.id));
        showToast("success", "Deleted", "Item deleted successfully");
      } else {
        showToast("destructive", "Error", "Failed to delete item");
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      showToast("destructive", "Error", "Failed to delete item");
    } finally {
      setDeleteModal({ isOpen: false, item: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, item: null });
  };

  const handleExport = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "EXPORT_DATA",
        data: { format: "json" },
      });

      if (response.success) {
        // Create download link
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `kansu-data-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast("success", "Exported", "Data exported successfully");
      } else {
        showToast("destructive", "Error", "Failed to export data");
      }
    } catch (error) {
      console.error("Failed to export data:", error);
      showToast("destructive", "Error", "Failed to export data");
    }
  };

  const handleRefresh = () => {
    loadData();
    showToast("info", "Refreshed", "Data refreshed");
  };

  const formatDate = (date: Date) => {
    try {
      return date.toLocaleString();
    } catch {
      return date.toString();
    }
  };

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const getFieldValue = (data: ExtractedData, fieldId: string): string => {
    return data?.fieldData?.[fieldId] || "";
  };

  const columns: DataTableColumn[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (_value, row) => (
        <div className="max-w-xs">
          <div className="font-medium truncate">{getFieldValue(row, "title") || "No Title"}</div>
          <div className="text-xs text-muted-foreground truncate">{formatUrl(row.sourceUrl)}</div>
        </div>
      ),
    },
    {
      key: "content",
      label: "Content",
      sortable: true,
      render: (_value, row) => (
        <div className="max-w-sm truncate" title={getFieldValue(row, "content")}>
          {getFieldValue(row, "content") || "No Content"}
        </div>
      ),
    },
    {
      key: "extractedAt",
      label: "Date",
      sortable: true,
      render: (_value, row) => <div className="text-sm">{formatDate(row.extractedAt)}</div>,
    },
    {
      key: "serviceId",
      label: "Service",
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {String(value)}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading data...</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kansu Data Manager</h1>
          <p className="text-muted-foreground">
            Manage your extracted data from infinite scroll websites
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={data.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold">{data.length}</div>
          <div className="text-sm text-muted-foreground">Total Items</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold">
            {new Set(data.map((item) => item.serviceId)).size}
          </div>
          <div className="text-sm text-muted-foreground">Services</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold">
            {data.length > 0
              ? new Date(
                  Math.max(...data.map((item) => new Date(item.extractedAt).getTime())),
                ).toLocaleDateString()
              : "N/A"}
          </div>
          <div className="text-sm text-muted-foreground">Last Updated</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable data={data} columns={columns} onRowDelete={handleDeleteClick} pageSize={20} />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={handleDeleteCancel} size="sm">
        <ModalHeader>
          <ModalTitle>Delete Item</ModalTitle>
          <ModalDescription>
            Are you sure you want to delete this item? This action cannot be undone.
          </ModalDescription>
        </ModalHeader>
        <ModalContent>
          {deleteModal.item && (
            <div className="space-y-2">
              <div className="font-medium">
                {getFieldValue(deleteModal.item, "title") || "No Title"}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatUrl(deleteModal.item.sourceUrl)}
              </div>
            </div>
          )}
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteConfirm}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      {/* Toast Notification */}
      {toast.isVisible && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast variant={toast.variant} onClose={hideToast}>
            <ToastTitle>{toast.title}</ToastTitle>
            <ToastDescription>{toast.description}</ToastDescription>
          </Toast>
        </div>
      )}
    </div>
  );
}

export { MainUI, type MainUIProps };
