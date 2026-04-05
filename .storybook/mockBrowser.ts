import type { ResponseMessage } from "@/lib/messages";
import type { ExtractedRecord, SearchResult, ServiceConfig } from "@/lib/types";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const defaultConfigs: ServiceConfig[] = [
  {
    id: "service-demo",
    name: "デモサービス",
    urlPatterns: ["https://example.com/*"],
    observeRootSelector: "#root",
    itemSelector: ".item",
    uniqueKeyField: "title",
    fieldRules: [
      { name: "title", selector: ".title", type: "text" },
      { name: "url", selector: "a", type: "linkUrl" },
      { name: "author", selector: ".author", type: "text" },
    ],
    enabled: true,
    updatedAt: "2026-04-05T00:00:00.000Z",
  },
];

const defaultRecords: ExtractedRecord[] = [
  {
    serviceId: "service-demo",
    uniqueKey: "記事A",
    extractedAt: "2026-04-05T00:00:00.000Z",
    fieldValues: {
      title: { raw: "記事A", normalized: "記事a" },
      url: { raw: "https://example.com/a", normalized: "https://example.com/a" },
      author: { raw: "田中", normalized: "田中" },
    },
  },
  {
    serviceId: "service-demo",
    uniqueKey: "記事B",
    extractedAt: "2026-04-05T00:00:00.000Z",
    fieldValues: {
      title: { raw: "記事B", normalized: "記事b" },
      url: { raw: "https://example.com/b", normalized: "https://example.com/b" },
      author: { raw: "佐藤", normalized: "佐藤" },
    },
  },
];

let configs = clone(defaultConfigs);
let records = clone(defaultRecords);

const ok = <T>(data: T): ResponseMessage<T> => ({ ok: true, data });
const error = (code: string, message: string): ResponseMessage<never> => ({
  ok: false,
  error: { code, message },
});

export const resetMockBrowserState = () => {
  configs = clone(defaultConfigs);
  records = clone(defaultRecords);
};

export const setMockConfigs = (nextConfigs: ServiceConfig[]) => {
  configs = clone(nextConfigs);
};

export const setMockSearchResult = (nextResult: SearchResult) => {
  records = clone(nextResult.records);
};

const mockBrowser = {
  runtime: {
    sendMessage: async (message: unknown): Promise<ResponseMessage> => {
      if (!message || typeof message !== "object" || !("type" in message)) {
        return error("INVALID_MESSAGE", "invalid message");
      }

      const typed = message as { type: string; payload?: unknown };
      switch (typed.type) {
        case "configs/list":
          return ok({ configs: clone(configs) });
        case "configs/save": {
          const config = typed.payload as ServiceConfig;
          const index = configs.findIndex((item) => item.id === config.id);
          if (index === -1) {
            configs.push(clone(config));
          } else {
            configs[index] = clone(config);
          }
          return ok({ configId: config.id });
        }
        case "configs/delete": {
          const payload = typed.payload as { id: string; deleteRecords?: boolean };
          configs = configs.filter((item) => item.id !== payload.id);
          if (payload.deleteRecords) {
            records = records.filter((item) => item.serviceId !== payload.id);
          }
          return ok({ deletedRecords: payload.deleteRecords ? 2 : 0 });
        }
        case "records/search": {
          const payload = typed.payload as { serviceId: string };
          const filtered = records.filter((item) =>
            payload.serviceId ? item.serviceId === payload.serviceId : true,
          );
          return ok({
            records: filtered,
            total: filtered.length,
          } satisfies SearchResult);
        }
        case "records/bulkUpsert":
          return ok({ upserted: 0 });
        case "data/export": {
          const payload = typed.payload as { serviceId: string };
          const service = configs.find((item) => item.id === payload.serviceId);
          if (!service) {
            return error("NOT_FOUND", "service config not found");
          }
          return ok({
            schemaVersion: 1,
            service,
            records: records.filter((item) => item.serviceId === payload.serviceId),
            meta: {
              exportedAt: new Date().toISOString(),
            },
          });
        }
        case "data/import":
          return ok({ importedRecords: 0, skippedRecords: 0 });
        default:
          return error("UNSUPPORTED_MESSAGE", `unsupported message type: ${typed.type}`);
      }
    },
    openOptionsPage: async () => undefined,
  },
  tabs: {
    query: async () => [{ id: 1 }],
    sendMessage: async () => undefined,
  },
} as unknown as typeof browser;

const globalWithBrowser = globalThis as typeof globalThis & {
  browser?: typeof mockBrowser;
};

if (globalWithBrowser.browser === undefined) {
  globalWithBrowser.browser = mockBrowser;
}
