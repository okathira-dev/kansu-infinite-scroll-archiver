import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../input";
import { Label } from "./index";

const meta = {
  component: Label,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: "ラベル文言",
  },
  render: (args) => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="sb-label-playground">{args.children}</Label>
      <Input id="sb-label-playground" placeholder="入力" className="w-72" />
    </div>
  ),
};

export const WithInput: Story = {
  render: () => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="email">メールアドレス</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
};
