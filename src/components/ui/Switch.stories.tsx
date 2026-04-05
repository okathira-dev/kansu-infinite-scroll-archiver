import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./label";
import { Switch } from "./switch";

const meta = {
  title: "UI/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  args: {
    disabled: false,
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="enable" defaultChecked />
      <Label htmlFor="enable">有効化</Label>
    </div>
  ),
};

export const Small: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="small" size="sm" />
      <Label htmlFor="small">小サイズ</Label>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};
