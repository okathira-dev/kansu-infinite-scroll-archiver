import { resolveServiceNotificationSettings, type ServiceNotificationSettings } from "@/lib/types";

interface TabBadgeState {
  serviceId: string;
  monitoringActive: boolean;
  totalSaved: number;
  notificationSettings: ServiceNotificationSettings;
}

interface SetMonitoringInput {
  active: boolean;
  serviceId: string;
  notificationSettings: ServiceNotificationSettings;
  /** IndexedDB に保存済みの件数（ページ読み込み時点）。 */
  persistedRecordCount?: number;
}

interface StoredTotalInput {
  serviceId: string;
  total: number;
  notificationSettings?: ServiceNotificationSettings;
}

const formatSavedCount = (count: number): string => {
  if (count <= 9_999) {
    return String(count);
  }
  if (count <= 999_999) {
    return `${Math.floor(count / 1_000)}K`;
  }
  if (count <= 9_999_999) {
    const value = (count / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return `${value}M`;
  }
  return "10M+";
};

export class TabBadgeStateManager {
  private readonly stateByTabId = new Map<number, TabBadgeState>();

  setMonitoring(tabId: number, input: SetMonitoringInput): void {
    if (!input.active) {
      this.stateByTabId.delete(tabId);
      return;
    }

    const persisted =
      typeof input.persistedRecordCount === "number" && Number.isFinite(input.persistedRecordCount)
        ? Math.max(0, Math.floor(input.persistedRecordCount))
        : 0;

    this.stateByTabId.set(tabId, {
      serviceId: input.serviceId,
      monitoringActive: true,
      totalSaved: persisted,
      notificationSettings: resolveServiceNotificationSettings(input.notificationSettings),
    });
  }

  /** bulkUpsert 後など、IndexedDB 上の実件数でバッジ表示を上書きする。 */
  setStoredRecordTotal(tabId: number, input: StoredTotalInput): void {
    if (!Number.isFinite(input.total) || input.total < 0) {
      return;
    }

    const state = this.stateByTabId.get(tabId);
    const nextSettings = resolveServiceNotificationSettings(
      input.notificationSettings ?? state?.notificationSettings,
    );
    const totalSaved = Math.max(0, Math.floor(input.total));

    this.stateByTabId.set(tabId, {
      serviceId: input.serviceId,
      monitoringActive: true,
      totalSaved,
      notificationSettings: nextSettings,
    });
  }

  clear(tabId: number): void {
    this.stateByTabId.delete(tabId);
  }

  getBadgeText(tabId: number): string {
    const state = this.stateByTabId.get(tabId);
    if (!state) {
      return "";
    }

    if (state.notificationSettings.badge.showTotalSavedCount && state.totalSaved > 0) {
      return formatSavedCount(state.totalSaved);
    }
    if (state.notificationSettings.badge.showMonitoringIndicator && state.monitoringActive) {
      return "ON";
    }
    return "";
  }
}
