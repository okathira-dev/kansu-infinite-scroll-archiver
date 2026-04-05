import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SearchBar } from "./SearchBar";

const meta = {
  title: "Content/SearchBar",
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
  render: (args) => {
    const [keyword, setKeyword] = useState(args.keyword);
    const [targetFieldNames, setTargetFieldNames] = useState(args.targetFieldNames);
    const [pageSize, setPageSize] = useState(args.pageSize);

    const handleToggleTargetField = (fieldName: string) => {
      setTargetFieldNames((current) =>
        current.includes(fieldName)
          ? current.filter((name) => name !== fieldName)
          : [...current, fieldName],
      );
    };

    return (
      <div className="w-[560px] rounded-md border bg-card p-4">
        <SearchBar
          keyword={keyword}
          targetFieldNames={targetFieldNames}
          pageSize={pageSize}
          availableFieldNames={args.availableFieldNames}
          onKeywordChange={setKeyword}
          onToggleTargetField={handleToggleTargetField}
          onPageSizeChange={setPageSize}
        />
      </div>
    );
  },
};
