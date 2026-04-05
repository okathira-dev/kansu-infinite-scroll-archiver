import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./separator";

const meta = {
  title: "UI/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-72 space-y-2">
      <p className="text-sm">上段</p>
      <Separator />
      <p className="text-sm">下段</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-20 items-center gap-4">
      <span className="text-sm">左</span>
      <Separator orientation="vertical" />
      <span className="text-sm">右</span>
    </div>
  ),
};
