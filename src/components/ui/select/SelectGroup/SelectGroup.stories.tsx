import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../index";

const meta = {
  component: SelectGroup,
  parameters: {
    layout: "centered",
  },
  args: {
    children: (
      <>
        <SelectLabel>グループA</SelectLabel>
        <SelectItem value="a1">項目 A-1</SelectItem>
        <SelectItem value="a2">項目 A-2</SelectItem>
      </>
    ),
  },
} satisfies Meta<typeof SelectGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("a1");

    return (
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-64" aria-label="グループ付きセレクト">
          <SelectValue placeholder="選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup {...args}>{args.children}</SelectGroup>
        </SelectContent>
      </Select>
    );
  },
};
