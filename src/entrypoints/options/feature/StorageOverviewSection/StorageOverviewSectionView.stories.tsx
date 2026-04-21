import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ExtensionStorageEstimate } from "@/lib/storage/extensionStorageEstimate";
import type { ServiceConfig } from "@/lib/types";
import { StorageOverviewSectionView } from "./StorageOverviewSectionView";

const demoConfigs: ServiceConfig[] = [
  {
    id: "service-demo",
    name: "デモサービス",
    urlPatterns: ["https://example.com/*"],
    observeRootSelector: "#root",
    itemSelector: ".item",
    uniqueKeyField: "title",
    fieldRules: [{ name: "title", selector: ".title", type: "text" }],
    enabled: true,
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
];

const demoEstimate: ExtensionStorageEstimate = {
  usageBytes: 1024 * 1024 * 12,
  quotaBytes: 1024 * 1024 * 128,
  indexedDbBytes: 1024 * 1024 * 7,
};

const meta = {
  component: StorageOverviewSectionView,
  parameters: {
    layout: "centered",
    controls: {
      exclude: /^on[A-Z].*/,
    },
  },
  args: {
    storageLoading: false,
    storageError: null,
    storageEstimate: demoEstimate,
    countsByServiceId: { "service-demo": 24, orphan: 3 },
    configs: demoConfigs,
    orphanRecordServiceIds: ["orphan"],
    onReload: () => undefined,
  },
} satisfies Meta<typeof StorageOverviewSectionView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    storageLoading: true,
  },
};

export const ErrorState: Story = {
  args: {
    storageError: "network timeout",
  },
};

export const NoServices: Story = {
  args: {
    configs: [],
    orphanRecordServiceIds: [],
  },
};
