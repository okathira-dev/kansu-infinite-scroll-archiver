import type { Meta, StoryObj } from "@storybook/react-vite";
import { resetMockBrowserState } from "../../../.storybook/mockBrowser";
import App from "./App";

const meta = {
  title: "Popup/App",
  component: App,
  parameters: {
    layout: "centered",
  },
  args: {},
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    resetMockBrowserState();
    return <App />;
  },
};
