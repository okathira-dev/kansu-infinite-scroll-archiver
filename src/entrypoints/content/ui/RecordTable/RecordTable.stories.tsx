import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useArgs } from "storybook/preview-api";
import type { ExtractedRecord, SortOrder } from "@/lib/types";
import { RecordTable } from "./index";

type RecordTableStoryArgs = ComponentProps<typeof RecordTable>;

const demoRecords: ExtractedRecord[] = [
  {
    serviceId: "service-demo",
    uniqueKey: "post-001",
    extractedAt: "2026-04-05T00:00:00.000Z",
    fieldValues: {
      title: { raw: "無限スクロール記事 A", normalized: "むげんすくろーるきじa" },
      author: { raw: "田中", normalized: "たなか" },
      url: { raw: "https://example.com/a", normalized: "https://example.com/a" },
    },
  },
  {
    serviceId: "service-demo",
    uniqueKey: "post-002",
    extractedAt: "2026-04-05T00:00:00.000Z",
    fieldValues: {
      title: { raw: "無限スクロール記事 B", normalized: "むげんすくろーるきじb" },
      author: { raw: "佐藤", normalized: "さとう" },
      url: { raw: "https://example.com/b", normalized: "https://example.com/b" },
    },
  },
];

const fieldNames = ["title", "author", "url"];

const meta = {
  component: RecordTable,
  decorators: [
    (Story) => (
      <div className="w-[760px] rounded-md border bg-card p-4">
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
    records: demoRecords,
    fieldNames,
    sortBy: "title",
    sortOrder: "asc",
    onSortBy: () => undefined,
  },
} satisfies Meta<typeof RecordTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [args, updateArgs] = useArgs<RecordTableStoryArgs>();

    const handleSortBy = (fieldName: string) => {
      const by = args.sortBy;
      const order = args.sortOrder as SortOrder;
      if (by === fieldName) {
        updateArgs({ sortOrder: order === "asc" ? "desc" : "asc" });
      } else {
        updateArgs({ sortBy: fieldName, sortOrder: "asc" });
      }
    };

    return (
      <RecordTable
        records={args.records}
        fieldNames={args.fieldNames}
        sortBy={args.sortBy}
        sortOrder={args.sortOrder as SortOrder}
        onSortBy={handleSortBy}
      />
    );
  },
};

export const NoFields: Story = {
  args: {
    fieldNames: [],
  },
  render: (args) => (
    <RecordTable
      records={args.records}
      fieldNames={args.fieldNames}
      sortBy={args.sortBy}
      sortOrder={args.sortOrder}
      onSortBy={args.onSortBy}
    />
  ),
};
