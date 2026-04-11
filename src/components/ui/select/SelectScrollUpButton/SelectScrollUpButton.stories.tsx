import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../index";
import { SelectScrollUpButton } from "./index";

const demoItems = Array.from({ length: 40 }, (_, i) => ({ value: `v${i}`, label: i + 1 }));

const meta = {
  component: SelectScrollUpButton,
  parameters: {
    layout: "centered",
  },
  args: {
    className: "",
  },
} satisfies Meta<typeof SelectScrollUpButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 通常の Select 構成のまま、上スクロールボタンだけ Controls の対象にする。 */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("v0");

    return (
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-64" aria-label="上スクロールボタン確認">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-36" scrollUpButtonProps={args}>
          {demoItems.map(({ value: itemValue, label }) => (
            <SelectItem key={itemValue} value={itemValue}>
              項目 {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },
};
