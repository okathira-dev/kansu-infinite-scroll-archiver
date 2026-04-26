import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../input";
import { Label } from "./index";

const meta = {
  component: Label,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "ラベル文言",
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const { htmlFor = "sb-label-playground", ...labelArgs } = args;
    return (
      <div className="grid w-72 gap-2">
        <Label htmlFor={htmlFor} {...labelArgs} />
        <Input id={htmlFor} placeholder="入力" className="w-72" />
      </div>
    );
  },
};

export const WithInput: Story = {
  args: {
    children: "メールアドレス",
  },
  render: (args) => {
    const { htmlFor = "email", ...labelArgs } = args;
    return (
      <div className="grid w-72 gap-2">
        <Label htmlFor={htmlFor} {...labelArgs} />
        <Input id={htmlFor} type="email" placeholder="you@example.com" />
      </div>
    );
  },
};
