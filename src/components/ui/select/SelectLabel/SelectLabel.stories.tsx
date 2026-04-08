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
  component: SelectLabel,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "ラベル文言",
  },
} satisfies Meta<typeof SelectLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("a");

    return (
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-64" aria-label="ラベル付きリスト">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel {...args} />
            <SelectItem value="a">選択肢 A</SelectItem>
            <SelectItem value="b">選択肢 B</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  },
};
