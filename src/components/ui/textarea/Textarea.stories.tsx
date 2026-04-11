import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./index";

const meta = {
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  args: {
    className: "w-80",
    placeholder: "抽出条件のメモを入力",
    "aria-label": "メモ入力",
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithRows: Story = {
  args: {
    rows: 6,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "この項目は編集できません。",
  },
};
