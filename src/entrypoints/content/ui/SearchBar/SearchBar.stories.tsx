import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useArgs } from "storybook/preview-api";
import { SearchBar } from "./index";

type SearchBarStoryArgs = ComponentProps<typeof SearchBar> & {
  containerClassName: string;
};

function SearchBarStory({ containerClassName, ...props }: SearchBarStoryArgs) {
  return (
    <div className={containerClassName}>
      <SearchBar {...props} />
    </div>
  );
}

const meta = {
  component: SearchBarStory,
  parameters: {
    layout: "centered",
  },
  args: {
    containerClassName: "w-[560px] rounded-md border bg-card p-4",
    keyword: "",
    targetFieldNames: ["title"],
    pageSize: 10,
    availableFieldNames: ["title", "author", "url"],
    onKeywordChange: () => undefined,
    onToggleTargetField: () => undefined,
    onPageSizeChange: () => undefined,
  },
} satisfies Meta<typeof SearchBarStory>;

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
      <SearchBarStory
        containerClassName={args.containerClassName}
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
