import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  args: {
    placeholder: "キーワードを入力",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "w-72",
  },
};

export const Disabled: Story = {
  args: {
    className: "w-72",
    disabled: true,
    value: "入力不可",
  },
};

export const Password: Story = {
  args: {
    className: "w-72",
    type: "password",
    value: "secret-value",
  },
};
