import { describe, expect, it } from "vitest";
import { TabBadgeStateManager } from "./tabBadgeStateManager";

const fullNotificationSettings = {
  badge: {
    showMonitoringIndicator: true,
    showTotalSavedCount: true,
  },
  toast: {
    enabled: true,
    showIncrementCount: true,
  },
} as const;

describe("TabBadgeStateManager", () => {
  it("監視開始時は ON バッジを返す", () => {
    const manager = new TabBadgeStateManager();
    manager.setMonitoring(1, {
      active: true,
      serviceId: "service-1",
      notificationSettings: fullNotificationSettings,
    });

    expect(manager.getBadgeText(1)).toBe("ON");
  });

  it("保存件数が増えると合計件数バッジへ切り替える", () => {
    const manager = new TabBadgeStateManager();
    manager.setMonitoring(1, {
      active: true,
      serviceId: "service-1",
      notificationSettings: fullNotificationSettings,
    });
    manager.setStoredRecordTotal(1, {
      serviceId: "service-1",
      total: 7,
      notificationSettings: fullNotificationSettings,
    });
    manager.setStoredRecordTotal(1, {
      serviceId: "service-1",
      total: 12,
      notificationSettings: fullNotificationSettings,
    });

    expect(manager.getBadgeText(1)).toBe("12");
  });

  it("監視開始時に既存件数があればバッジに件数を表示する", () => {
    const manager = new TabBadgeStateManager();
    manager.setMonitoring(1, {
      active: true,
      serviceId: "service-1",
      notificationSettings: fullNotificationSettings,
      persistedRecordCount: 42,
    });

    expect(manager.getBadgeText(1)).toBe("42");
  });

  it("合計件数表示を無効にした場合は監視中 ON を維持する", () => {
    const manager = new TabBadgeStateManager();
    manager.setMonitoring(1, {
      active: true,
      serviceId: "service-1",
      notificationSettings: {
        ...fullNotificationSettings,
        badge: {
          showMonitoringIndicator: true,
          showTotalSavedCount: false,
        },
      },
    });
    manager.setStoredRecordTotal(1, {
      serviceId: "service-1",
      total: 100,
    });

    expect(manager.getBadgeText(1)).toBe("ON");
  });

  it("監視停止時はバッジをクリアする", () => {
    const manager = new TabBadgeStateManager();
    manager.setMonitoring(1, {
      active: true,
      serviceId: "service-1",
      notificationSettings: fullNotificationSettings,
    });
    manager.setMonitoring(1, {
      active: false,
      serviceId: "service-1",
      notificationSettings: fullNotificationSettings,
    });

    expect(manager.getBadgeText(1)).toBe("");
  });
});
