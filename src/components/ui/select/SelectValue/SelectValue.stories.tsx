import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../index";

const meta = {
  component: SelectValue,
  parameters: {
    layout: "centered",
  },
  args: {
    placeholder: "未選択",
  },
} satisfies Meta<typeof SelectValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Select
      value="x"
      items={[{ value: "x", label: "表示されるラベル" }]}
      onValueChange={() => undefined}
    >
      <SelectTrigger className="w-64" aria-label="値表示プレビュー">
        <SelectValue {...args} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="x">表示されるラベル</SelectItem>
      </SelectContent>
    </Select>
  ),
};
