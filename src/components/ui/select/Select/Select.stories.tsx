import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../index";

const meta = {
  component: Select,
  parameters: {
    layout: "centered",
  },
  args: {
    value: "createdAt",
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ルートの `value` を `useArgs` で Controls と同期。 */
export const Default: Story = {
  render: () => {
    const [args, updateArgs] = useArgs<typeof meta.args>();
    const value = args?.value ?? "createdAt";
    const items = [
      { value: "createdAt", label: "作成日" },
      { value: "title", label: "タイトル" },
      { value: "author", label: "作成者" },
    ];

    return (
      <Select
        value={value}
        items={items}
        onValueChange={(v) => {
          updateArgs({ value: v });
        }}
      >
        <SelectTrigger className="w-64" aria-label="ソート項目">
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
