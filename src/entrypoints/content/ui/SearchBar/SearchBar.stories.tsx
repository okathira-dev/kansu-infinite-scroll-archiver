import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { SearchBar } from "./index";

const meta = {
  component: SearchBar,
  parameters: {
    layout: "centered",
  },
  args: {
    keyword: "",
    targetFieldNames: ["title"],
    pageSize: 10,
    availableFieldNames: ["title", "author", "url"],
    onKeywordChange: () => undefined,
    onToggleTargetField: () => undefined,
    onPageSizeChange: () => undefined,
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [args, updateArgs] = useArgs<typeof meta.args>();

    const handleToggleTargetField = (fieldName: string) => {
      const current = args?.targetFieldNames ?? [];
      updateArgs({
        targetFieldNames: current.includes(fieldName)
          ? current.filter((name) => name !== fieldName)
          : [...current, fieldName],
      });
    };

    return (
      <div className="w-[560px] rounded-md border bg-card p-4">
        <SearchBar
          keyword={args?.keyword ?? ""}
          targetFieldNames={args?.targetFieldNames ?? ["title"]}
          pageSize={args?.pageSize ?? 10}
          availableFieldNames={args?.availableFieldNames ?? ["title", "author", "url"]}
          onKeywordChange={(k) => {
            updateArgs({ keyword: k });
          }}
          onToggleTargetField={handleToggleTargetField}
          onPageSizeChange={(s) => {
            updateArgs({ pageSize: s });
          }}
        />
      </div>
    );
  },
};
