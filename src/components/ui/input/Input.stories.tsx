import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./index";

const meta = {
  component: Input,
  parameters: {
    layout: "centered",
  },
  args: {
    placeholder: "キーワードを入力",
    className: "w-72",
    "aria-label": "入力欄",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "入力不可",
  },
};

export const Password: Story = {
  args: {
    type: "password",
    defaultValue: "secret-value",
  },
};
