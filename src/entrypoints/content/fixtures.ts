import { resolveServiceNotificationSettings, type ServiceConfig } from "@/lib/types";

export const sampleServiceConfig: ServiceConfig = {
  id: "service-example",
  name: "Example Service",
  urlPatterns: ["*://example.com/*"],
  observeRootSelector: "#feed",
  itemSelector: ".item",
  uniqueKeyField: "id",
  fieldRules: [
    { name: "id", selector: ".id", type: "text" },
    { name: "title", selector: ".title", type: "text" },
    { name: "link", selector: ".link", type: "linkUrl" },
    { name: "thumbnail", selector: ".thumb", type: "imageUrl" },
    { name: "digits", selector: ".title", type: "regex", regex: "(\\d+)" },
  ],
  enabled: true,
  notificationSettings: resolveServiceNotificationSettings(undefined),
  updatedAt: "2026-04-02T00:00:00.000Z",
};

export const samplePageUrl = "https://example.com/feed";
