import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useArgs } from "storybook/preview-api";
import { SearchBar } from "./index";

type SearchBarStoryArgs = ComponentProps<typeof SearchBar>;

const meta = {
  component: SearchBar,
  decorators: [
    (Story) => (
      <div className="w-[560px] rounded-md border bg-card p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
    controls: {
      exclude: /^on[A-Z].*/,
    },
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
    const [args, updateArgs] = useArgs<SearchBarStoryArgs>();

    const handleToggleTargetField = (fieldName: string) => {
      const current = args.targetFieldNames;
      updateArgs({
        targetFieldNames: current.includes(fieldName)
          ? current.filter((name) => name !== fieldName)
          : [...current, fieldName],
      });
    };

    return (
      <SearchBar
        keyword={args.keyword}
        targetFieldNames={args.targetFieldNames}
        pageSize={args.pageSize}
        availableFieldNames={args.availableFieldNames}
        onKeywordChange={(k) => {
          updateArgs({ keyword: k });
        }}
        onToggleTargetField={handleToggleTargetField}
        onPageSizeChange={(s) => {
          updateArgs({ pageSize: s });
        }}
      />
    );
  },
};
