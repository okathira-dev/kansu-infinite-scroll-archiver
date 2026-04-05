import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./textarea";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  args: {
    className: "w-80",
    placeholder: "抽出条件のメモを入力",
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
    value: "この項目は編集できません。",
  },
};
