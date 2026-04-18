import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useArgs } from "storybook/preview-api";
import type { SearchQuery, SearchResult, ServiceConfig } from "@/lib/types";
import "../style.css";
import { MainPanelView } from "./index";

type MainPanelStoryArgs = ComponentProps<typeof MainPanelView>;

const demoConfigs: ServiceConfig[] = [
  {
    id: "service-demo",
    name: "デモサービス",
    urlPatterns: ["https://example.com/*"],
    observeRootSelector: "#root",
    itemSelector: ".item",
    uniqueKeyField: "title",
    fieldRules: [
      { name: "title", selector: ".title", type: "text" },
      { name: "author", selector: ".author", type: "text" },
      { name: "url", selector: "a", type: "linkUrl" },
    ],
    enabled: true,
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
];

const demoQuery: SearchQuery = {
  serviceId: "service-demo",
  keyword: "",
  targetFieldNames: ["title", "author"],
  sortBy: "title",
  sortOrder: "asc",
  page: 1,
  pageSize: 10,
};

const demoResult: SearchResult = {
  total: 2,
  records: [
    {
      serviceId: "service-demo",
      uniqueKey: "post-001",
      extractedAt: "2026-04-12T00:00:00.000Z",
      fieldValues: {
        title: { raw: "無限スクロール記事 A", normalized: "むげんすくろーるきじa" },
        author: { raw: "田中", normalized: "たなか" },
        url: { raw: "https://example.com/a", normalized: "https://example.com/a" },
      },
    },
    {
      serviceId: "service-demo",
      uniqueKey: "post-002",
      extractedAt: "2026-04-12T00:00:00.000Z",
      fieldValues: {
        title: { raw: "無限スクロール記事 B", normalized: "むげんすくろーるきじb" },
        author: { raw: "佐藤", normalized: "さとう" },
        url: { raw: "https://example.com/b", normalized: "https://example.com/b" },
      },
    },
  ],
};

const meta = {
  component: MainPanelView,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    configs: demoConfigs,
    query: demoQuery,
    result: demoResult,
    loading: false,
    availableFieldNames: ["title", "author", "url"],
    onRequestClose: () => undefined,
    onConfigChange: () => undefined,
    onKeywordChange: () => undefined,
    onToggleTargetField: () => undefined,
    onPageSizeChange: () => undefined,
    onSortBy: () => undefined,
    onPageChange: () => undefined,
  },
} satisfies Meta<typeof MainPanelView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [args, updateArgs] = useArgs<MainPanelStoryArgs>();
    const query = args?.query ?? demoQuery;
    const availableFieldNames = args?.availableFieldNames ?? ["title", "author", "url"];

    return (
      <div className="min-h-screen bg-muted/20 p-6">
        <MainPanelView
          onRequestClose={args?.onRequestClose ?? (() => undefined)}
          configs={args?.configs ?? demoConfigs}
          query={query}
          result={args?.result ?? demoResult}
          loading={args?.loading ?? false}
          availableFieldNames={availableFieldNames}
          onConfigChange={(serviceId) => {
            updateArgs({
              query: { ...query, serviceId, page: 1 },
            });
          }}
          onKeywordChange={(keyword) => {
            updateArgs({
              query: { ...query, keyword, page: 1 },
            });
          }}
          onToggleTargetField={(fieldName) => {
            const selected = query.targetFieldNames.includes(fieldName);
            const nextFieldNames = selected
              ? query.targetFieldNames.filter((name) => name !== fieldName)
              : [...query.targetFieldNames, fieldName];
            updateArgs({
              query: {
                ...query,
                targetFieldNames: nextFieldNames,
                page: 1,
              },
            });
          }}
          onPageSizeChange={(pageSize) => {
            updateArgs({
              query: { ...query, pageSize, page: 1 },
            });
          }}
          onSortBy={(fieldName) => {
            if (query.sortBy === fieldName) {
              updateArgs({
                query: {
                  ...query,
                  sortOrder: query.sortOrder === "asc" ? "desc" : "asc",
                },
              });
              return;
            }
            updateArgs({
              query: {
                ...query,
                sortBy: fieldName,
                sortOrder: "asc",
              },
            });
          }}
          onPageChange={(page) => {
            updateArgs({
              query: { ...query, page },
            });
          }}
        />
      </div>
    );
  },
};

export const Empty: Story = {
  args: {
    configs: [],
    query: {
      serviceId: "",
      keyword: "",
      targetFieldNames: [],
      sortBy: "",
      sortOrder: "asc",
      page: 1,
      pageSize: 10,
    },
    result: { records: [], total: 0 },
    availableFieldNames: [],
  },
};
