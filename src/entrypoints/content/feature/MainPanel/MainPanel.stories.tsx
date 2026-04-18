import type { Meta, StoryObj } from "@storybook/react-vite";
import { useSearchStore, useServiceConfigStore } from "@/lib/stores";
import { resetMockBrowserState } from "../../../../../.storybook/mockBrowser";
import "../../ui/style.css";
import { MainPanel } from "./index";

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
  args: {
    onRequestClose: () => undefined,
  },
} satisfies Meta<typeof MainPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** store と browser mock を含む feature 統合ストーリー。 */
export const Default: Story = {};
