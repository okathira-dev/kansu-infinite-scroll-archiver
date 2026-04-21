import type { Meta, StoryObj } from "@storybook/react-vite";
import { useServiceConfigStore } from "@/lib/stores";
import type { ServiceConfig } from "@/lib/types";
import { resetMockBrowserState, setMockConfigs } from "../../../../.storybook/mockBrowser";
import App from "./index";

const populatedConfigs: ServiceConfig[] = [
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
    updatedAt: "2026-04-05T00:00:00.000Z",
  },
];

const resetStore = () => {
  useServiceConfigStore.setState({
    configs: [],
    loading: false,
    error: null,
  });
};

const meta = {
  component: App,
  parameters: {
    layout: "fullscreen",
    controls: {
      disable: true,
    },
  },
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  render: () => {
    resetMockBrowserState();
    setMockConfigs([]);
    resetStore();
    return <App />;
  },
};

export const WithConfigs: Story = {
  render: () => {
    resetMockBrowserState();
    setMockConfigs(populatedConfigs);
    resetStore();
    return <App />;
  },
};
