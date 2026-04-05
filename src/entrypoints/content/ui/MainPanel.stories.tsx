import type { Meta, StoryObj } from "@storybook/react-vite";
import { useSearchStore, useServiceConfigStore } from "@/lib/stores";
import { resetMockBrowserState } from "../../../../.storybook/mockBrowser";
import "./style.css";
import { MainPanel } from "./MainPanel";

const resetStores = () => {
  resetMockBrowserState();
  useServiceConfigStore.setState({
    configs: [],
    loading: false,
    error: null,
  });
  useSearchStore.setState({
    query: {
      serviceId: "",
      keyword: "",
      targetFieldNames: [],
      sortBy: "",
      sortOrder: "asc",
      page: 1,
      pageSize: 10,
    },
    result: {
      records: [],
      total: 0,
    },
    loading: false,
    error: null,
  });
};

const meta = {
  title: "Content/MainPanel",
  component: MainPanel,
  decorators: [
    (Story) => {
      resetStores();
      return (
        <div className="min-h-screen bg-muted/20 p-6">
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof MainPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onRequestClose: () => undefined,
  },
};
