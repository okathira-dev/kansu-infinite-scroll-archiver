import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../index";

const meta = {
  component: SelectItem,
  parameters: {
    layout: "centered",
  },
  args: {
    value: "main",
    children: "主役の項目",
    disabled: false,
    className: "",
  },
} satisfies Meta<typeof SelectItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controls の value と選択状態を `useArgs` で双方向同期（`useEffect` 不要）。 */
export const Default: Story = {
  render: () => {
    const [args, updateArgs] = useArgs<typeof meta.args>();

    return (
      <Select
        value={args.value}
        onValueChange={(v) => {
          updateArgs({ value: v });
        }}
      >
        <SelectTrigger className="w-64" aria-label="項目プレビュー">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem {...args}>{args.children}</SelectItem>
        </SelectContent>
      </Select>
    );
  },
};
