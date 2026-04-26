import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../index";

const meta = {
  component: SelectSeparator,
  parameters: {
    layout: "centered",
  },
  args: {
    className: "",
  },
} satisfies Meta<typeof SelectSeparator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("top");

    return (
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-64" aria-label="区切り線付きリスト">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="top">上段</SelectItem>
          <SelectSeparator {...args} />
          <SelectItem value="bottom">下段</SelectItem>
        </SelectContent>
      </Select>
    );
  },
};
