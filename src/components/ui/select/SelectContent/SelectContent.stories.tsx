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
    children: (
      <>
        <SelectItem value="1">項目 1</SelectItem>
        <SelectItem value="2">項目 2</SelectItem>
        <SelectItem value="3">項目 3</SelectItem>
      </>
    ),
  },
} satisfies Meta<typeof SelectContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("1");
    const items = [
      { value: "1", label: "項目 1" },
      { value: "2", label: "項目 2" },
      { value: "3", label: "項目 3" },
    ];

    return (
      <Select value={value} items={items} onValueChange={setValue}>
        <SelectTrigger className="w-64" aria-label="コンテンツ確認用">
          <SelectValue placeholder="選択" />
        </SelectTrigger>
        <SelectContent {...args}>{args.children}</SelectContent>
      </Select>
    );
  },
};

/** 一覧が縦に溢れると、Popup 内のネイティブスクロールで閲覧できます。 */
export const Scrollable: Story = {
  args: {
    className: "max-h-36",
    children: Array.from({ length: 40 }, (_, i) => ({ value: `v${i}`, label: i + 1 })).map(
      ({ value, label }) => (
        <SelectItem key={value} value={value}>
          項目 {label}
        </SelectItem>
      ),
    ),
  },
  render: (args) => {
    const [value, setValue] = useState("v0");
    const items = Array.from({ length: 40 }, (_, i) => ({
      value: `v${i}`,
      label: `項目 ${i + 1}`,
    }));

    return (
      <Select value={value} items={items} onValueChange={setValue}>
        <SelectTrigger className="w-64" aria-label="長い一覧">
          <SelectValue />
        </SelectTrigger>
        <SelectContent {...args}>{args.children}</SelectContent>
      </Select>
    );
  },
};
