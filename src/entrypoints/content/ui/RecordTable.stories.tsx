import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { ExtractedRecord, SortOrder } from "@/lib/types";
import { RecordTable } from "./RecordTable";

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
  title: "Content/RecordTable",
  component: RecordTable,
  parameters: {
    layout: "centered",
  },
  args: {
    records: [],
    fieldNames: [],
    sortBy: "title",
    sortOrder: "asc" as const,
    onSortBy: () => undefined,
  },
} satisfies Meta<typeof RecordTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [sortBy, setSortBy] = useState("title");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const handleSortBy = (fieldName: string) => {
      if (sortBy === fieldName) {
        setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(fieldName);
        setSortOrder("asc");
      }
    };

    return (
      <div className="w-[760px] rounded-md border bg-card p-4">
        <RecordTable
          records={demoRecords}
          fieldNames={fieldNames}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortBy={handleSortBy}
        />
      </div>
    );
  },
};

export const NoFields: Story = {
  render: () => (
    <div className="w-[760px] rounded-md border bg-card p-4">
      <RecordTable
        records={demoRecords}
        fieldNames={[]}
        sortBy="title"
        sortOrder="asc"
        onSortBy={() => undefined}
      />
    </div>
  ),
};
