import type { Meta, StoryObj } from "@storybook/react-vite";
import { resetMockBrowserState } from "../../../../.storybook/mockBrowser";
import App from "./index";

const meta = {
  component: App,
  parameters: {
    layout: "centered",
    controls: {
      disable: true,
    },
  },
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    resetMockBrowserState();
    return <App />;
  },
};
