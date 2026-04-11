import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./index";

const meta = {
  component: Button,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "ボタン",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="default">default</Button>
      <Button variant="secondary">secondary</Button>
      <Button variant="destructive">destructive</Button>
      <Button variant="outline">outline</Button>
      <Button variant="ghost">ghost</Button>
      <Button variant="link">link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="xs">xs</Button>
      <Button size="sm">sm</Button>
      <Button size="default">default</Button>
      <Button size="lg">lg</Button>
      <Button size="icon" aria-label="icon">
        ☆
      </Button>
      <Button size="icon-sm" aria-label="icon-sm">
        ☆
      </Button>
      <Button size="icon-lg" aria-label="icon-lg">
        ☆
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: "無効状態",
    disabled: true,
  },
};
