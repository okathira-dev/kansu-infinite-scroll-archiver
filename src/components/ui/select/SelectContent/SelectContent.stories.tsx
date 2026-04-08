import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../index";

const meta = {
  component: SelectContent,
  parameters: {
    layout: "centered",
  },
  args: {
    position: "item-aligned" as const,
    align: "center" as const,
    className: "",
  },
} satisfies Meta<typeof SelectContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("1");

    return (
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-64" aria-label="コンテンツ確認用">
          <SelectValue placeholder="選択" />
        </SelectTrigger>
        <SelectContent {...args}>
          <SelectItem value="1">項目 1</SelectItem>
          <SelectItem value="2">項目 2</SelectItem>
          <SelectItem value="3">項目 3</SelectItem>
        </SelectContent>
      </Select>
    );
  },
};

/** 一覧が縦に溢れると、SelectContent 内の ScrollUp / ScrollDown ボタンが表示されます。 */
export const Scrollable: Story = {
  args: {
    className: "max-h-36",
  },
  render: (args) => {
    const [value, setValue] = useState("v0");

    return (
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-64" aria-label="長い一覧">
          <SelectValue />
        </SelectTrigger>
        <SelectContent {...args}>
          {Array.from({ length: 40 }, (_, i) => ({ value: `v${i}`, label: i + 1 })).map(
            ({ value: itemValue, label }) => (
              <SelectItem key={itemValue} value={itemValue}>
                項目 {label}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>
    );
  },
};
