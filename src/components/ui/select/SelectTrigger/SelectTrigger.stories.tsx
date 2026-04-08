import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../index";

const meta = {
  component: SelectTrigger,
  parameters: {
    layout: "centered",
  },
  args: {
    size: "default" as const,
    className: "w-64",
    "aria-label": "ソート項目",
  },
} satisfies Meta<typeof SelectTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("createdAt");

    return (
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger {...args}>
          <SelectValue placeholder="項目を選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">作成日</SelectItem>
          <SelectItem value="title">タイトル</SelectItem>
        </SelectContent>
      </Select>
    );
  },
};
