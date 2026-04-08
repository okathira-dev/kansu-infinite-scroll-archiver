import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./index";

const meta = {
  component: Switch,
  parameters: {
    layout: "centered",
  },
  args: {
    "aria-label": "切り替え",
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: {
    size: "sm",
    "aria-label": "小サイズ",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
    "aria-label": "無効（オン）",
  },
};
