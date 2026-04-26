import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../index";

const sortOptions = [
  { value: "createdAt", label: "作成日" },
  { value: "title", label: "タイトル" },
  { value: "author", label: "作成者" },
] as const;

const defaultChildren = (
  <>
    <SelectTrigger className="w-64" aria-label="ソート項目">
      <SelectValue placeholder="ソート項目を選択" />
    </SelectTrigger>
    <SelectContent>
      {sortOptions.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </>
);

const meta = {
  component: Select,
  parameters: {
    layout: "centered",
  },
  args: {
    value: "createdAt",
    children: defaultChildren,
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ルートの `value` を `useArgs` で Controls と同期。 */
export const Default: Story = {
  render: () => {
    const [args, updateArgs] = useArgs<typeof meta.args>();

    return (
      <Select
        {...args}
        value={args.value}
        items={sortOptions}
        onValueChange={(v) => {
          updateArgs({ value: v });
        }}
      >
        {args.children}
      </Select>
    );
  },
};
