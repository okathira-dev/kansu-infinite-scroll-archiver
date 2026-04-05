import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "UI/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithInput: Story = {
  render: () => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="email">メールアドレス</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
};
