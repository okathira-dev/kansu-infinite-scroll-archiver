import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("createdAt");
    return (
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="ソート項目を選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">作成日</SelectItem>
          <SelectItem value="title">タイトル</SelectItem>
          <SelectItem value="author">作成者</SelectItem>
        </SelectContent>
      </Select>
    );
  },
};
