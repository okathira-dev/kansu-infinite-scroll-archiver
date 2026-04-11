import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./index";

const meta = {
  component: Separator,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    orientation: "horizontal",
  },
  render: (args) =>
    args.orientation === "vertical" ? (
      <div className="flex h-20 items-center gap-4">
        <span className="text-sm">左</span>
        <Separator orientation="vertical" />
        <span className="text-sm">右</span>
      </div>
    ) : (
      <div className="w-72 space-y-2">
        <p className="text-sm">上段</p>
        <Separator orientation={args.orientation} />
        <p className="text-sm">下段</p>
      </div>
    ),
};

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
  render: (args) => (
    <div className="w-72 space-y-2">
      <p className="text-sm">上段</p>
      <Separator orientation={args.orientation} />
      <p className="text-sm">下段</p>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex h-20 items-center gap-4">
      <span className="text-sm">左</span>
      <Separator orientation={args.orientation} />
      <span className="text-sm">右</span>
    </div>
  ),
};
