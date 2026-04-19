import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ServiceConfig } from "@/lib/types";
import { ServiceConfigsSectionView } from "./ServiceConfigsSectionView";

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
      { name: "url", selector: "a", type: "linkUrl" },
    ],
    enabled: true,
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
];

const meta = {
  component: ServiceConfigsSectionView,
  parameters: {
    layout: "centered",
  },
  args: {
    loading: false,
    configs: demoConfigs,
    onCreateConfig: () => undefined,
    onEditConfig: () => undefined,
    onRequestDeleteConfig: () => undefined,
  },
} satisfies Meta<typeof ServiceConfigsSectionView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    configs: [],
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    configs: [],
  },
};
