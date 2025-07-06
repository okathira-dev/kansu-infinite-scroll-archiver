import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ExtractedData } from "@/lib/types";
import { DataTable, type DataTableColumn } from "./data-table";

const mockData: ExtractedData[] = [
  {
    id: "1",
    sourceUrl: "https://example.com/1",
    fieldData: {
      title: "First Item",
      content: "Content 1",
    },
    extractedAt: new Date("2024-01-01"),
    hash: "hash1",
    serviceId: "service1",
  },
  {
    id: "2",
    sourceUrl: "https://example.com/2",
    fieldData: {
      title: "Second Item",
      content: "Content 2",
    },
    extractedAt: new Date("2024-01-02"),
    hash: "hash2",
    serviceId: "service1",
  },
  {
    id: "3",
    sourceUrl: "https://example.com/3",
    fieldData: {
      title: "Third Item",
      content: "Content 3",
    },
    extractedAt: new Date("2024-01-03"),
    hash: "hash3",
    serviceId: "service2",
  },
];

const defaultColumns: DataTableColumn[] = [
  {
    key: "title",
    label: "Title",
    sortable: true,
    render: (_, row) => row.fieldData?.title || "",
  },
  {
    key: "content",
    label: "Content",
    sortable: true,
    render: (_, row) => row.fieldData?.content || "",
  },
  {
    key: "url",
    label: "URL",
    sortable: false,
    render: (_, row) => row.sourceUrl,
  },
  {
    key: "timestamp",
    label: "Date",
    sortable: true,
    render: (_, row) => row.extractedAt.toLocaleDateString(),
  },
];

describe("DataTable", () => {
  describe("Basic Rendering", () => {
    it("should render table with data", () => {
      render(<DataTable data={mockData} columns={defaultColumns} />);

      expect(screen.getByText("First Item")).toBeInTheDocument();
      expect(screen.getByText("Second Item")).toBeInTheDocument();
      expect(screen.getByText("Third Item")).toBeInTheDocument();
    });

    it("should render column headers", () => {
      render(<DataTable data={mockData} columns={defaultColumns} />);

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
      expect(screen.getByText("URL")).toBeInTheDocument();
      expect(screen.getByText("Date")).toBeInTheDocument();
    });

    it("should render empty state when no data", () => {
      render(<DataTable data={[]} columns={defaultColumns} />);

      expect(screen.getByText("No data found")).toBeInTheDocument();
    });

    it("should render custom content with render function", () => {
      const customColumns: DataTableColumn[] = [
        {
          key: "title",
          label: "Title",
          render: (value) => <strong>{value}</strong>,
        },
      ];

      render(<DataTable data={mockData} columns={customColumns} />);

      const titleElements = screen.getAllByText("First Item")[0];
      expect(titleElements.tagName).toBe("STRONG");
    });
  });

  describe("Search Functionality", () => {
    it("should render search input by default", () => {
      render(<DataTable data={mockData} columns={defaultColumns} />);

      expect(screen.getByPlaceholderText("Search data...")).toBeInTheDocument();
    });

    it("should not render search input when searchable is false", () => {
      render(<DataTable data={mockData} columns={defaultColumns} searchable={false} />);

      expect(screen.queryByPlaceholderText("Search data...")).not.toBeInTheDocument();
    });

    it("should filter data based on search term", async () => {
      const user = userEvent.setup();
      render(<DataTable data={mockData} columns={defaultColumns} />);

      const searchInput = screen.getByPlaceholderText("Search data...");
      await user.type(searchInput, "First");

      expect(screen.getByText("First Item")).toBeInTheDocument();
      expect(screen.queryByText("Second Item")).not.toBeInTheDocument();
      expect(screen.queryByText("Third Item")).not.toBeInTheDocument();
    });

    it("should show clear button when search term exists", async () => {
      const user = userEvent.setup();
      render(<DataTable data={mockData} columns={defaultColumns} />);

      const searchInput = screen.getByPlaceholderText("Search data...");
      await user.type(searchInput, "test");

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should clear search when clear button is clicked", async () => {
      const user = userEvent.setup();
      render(<DataTable data={mockData} columns={defaultColumns} />);

      const searchInput = screen.getByPlaceholderText("Search data...");
      await user.type(searchInput, "First");

      const clearButton = screen.getByRole("button");
      await user.click(clearButton);

      expect(searchInput).toHaveValue("");
      expect(screen.getByText("First Item")).toBeInTheDocument();
      expect(screen.getByText("Second Item")).toBeInTheDocument();
    });
  });

  describe("Sorting Functionality", () => {
    it("should show sort icons for sortable columns", () => {
      render(<DataTable data={mockData} columns={defaultColumns} />);

      // Should have sort icons for sortable columns
      const titleHeader = screen.getByText("Title").closest("th");
      expect(titleHeader).toHaveClass("cursor-pointer");

      // Should not have sort icons for non-sortable columns
      const urlHeader = screen.getByText("URL").closest("th");
      expect(urlHeader).not.toHaveClass("cursor-pointer");
    });

    it("should sort data when column header is clicked", async () => {
      const user = userEvent.setup();
      render(<DataTable data={mockData} columns={defaultColumns} />);

      const titleHeader = screen.getByText("Title").closest("th");
      expect(titleHeader).toBeInTheDocument();
      if (titleHeader) {
        await user.click(titleHeader);
      }

      const rows = screen.getAllByRole("row");
      // Skip header row (index 0)
      expect(rows[1]).toHaveTextContent("First Item");
      expect(rows[2]).toHaveTextContent("Second Item");
      expect(rows[3]).toHaveTextContent("Third Item");
    });

    it("should reverse sort direction on second click", async () => {
      const user = userEvent.setup();
      render(<DataTable data={mockData} columns={defaultColumns} />);

      const titleHeader = screen.getByText("Title").closest("th");

      // First click - ascending
      expect(titleHeader).toBeInTheDocument();
      if (titleHeader) {
        await user.click(titleHeader);
        // Second click - descending
        await user.click(titleHeader);
      }

      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("Third Item");
      expect(rows[2]).toHaveTextContent("Second Item");
      expect(rows[3]).toHaveTextContent("First Item");
    });

    it("should not sort when sortable is false", async () => {
      const user = userEvent.setup();
      render(<DataTable data={mockData} columns={defaultColumns} sortable={false} />);

      const titleHeader = screen.getByText("Title").closest("th");
      expect(titleHeader).not.toHaveClass("cursor-pointer");

      expect(titleHeader).toBeInTheDocument();
      if (titleHeader) {
        await user.click(titleHeader);
      }

      // Order should remain unchanged
      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("First Item");
      expect(rows[2]).toHaveTextContent("Second Item");
      expect(rows[3]).toHaveTextContent("Third Item");
    });
  });

  describe("Pagination", () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      sourceUrl: `https://example.com/${i + 1}`,
      fieldData: {
        title: `Item ${i + 1}`,
        content: `Content ${i + 1}`,
      },
      extractedAt: new Date(`2024-01-${(i % 30) + 1}`),
      hash: `hash${i + 1}`,
      serviceId: "service1",
    }));

    it("should show pagination when data exceeds page size", () => {
      render(<DataTable data={largeData} columns={defaultColumns} pageSize={10} />);

      expect(screen.getByText("Previous")).toBeInTheDocument();
      expect(screen.getByText("Next")).toBeInTheDocument();
      expect(screen.getByText("Showing 1 to 10 of 25 entries")).toBeInTheDocument();
    });

    it("should not show pagination when pagination is disabled", () => {
      render(<DataTable data={largeData} columns={defaultColumns} pagination={false} />);

      expect(screen.queryByText("Previous")).not.toBeInTheDocument();
      expect(screen.queryByText("Next")).not.toBeInTheDocument();
    });

    it("should navigate to next page", async () => {
      const user = userEvent.setup();
      render(<DataTable data={largeData} columns={defaultColumns} pageSize={10} />);

      const nextButton = screen.getByText("Next");
      await user.click(nextButton);

      expect(screen.getByText("Showing 11 to 20 of 25 entries")).toBeInTheDocument();
      expect(screen.getByText("Item 11")).toBeInTheDocument();
    });

    it("should navigate to specific page", async () => {
      const user = userEvent.setup();
      render(<DataTable data={largeData} columns={defaultColumns} pageSize={10} />);

      const page2Button = screen.getByText("2");
      await user.click(page2Button);

      expect(screen.getByText("Showing 11 to 20 of 25 entries")).toBeInTheDocument();
    });

    it("should disable Previous button on first page", () => {
      render(<DataTable data={largeData} columns={defaultColumns} pageSize={10} />);

      const previousButton = screen.getByText("Previous");
      expect(previousButton).toBeDisabled();
    });

    it("should disable Next button on last page", async () => {
      const user = userEvent.setup();
      render(<DataTable data={largeData} columns={defaultColumns} pageSize={10} />);

      // Navigate to last page
      const page3Button = screen.getByText("3");
      await user.click(page3Button);

      const nextButton = screen.getByText("Next");
      expect(nextButton).toBeDisabled();
    });
  });

  describe("Row Interactions", () => {
    it("should call onRowClick when row is clicked", async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();
      render(<DataTable data={mockData} columns={defaultColumns} onRowClick={onRowClick} />);

      const firstRow = screen.getAllByRole("row")[1]; // Skip header
      await user.click(firstRow);

      expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    it("should add cursor-pointer class when onRowClick is provided", () => {
      const onRowClick = vi.fn();
      render(<DataTable data={mockData} columns={defaultColumns} onRowClick={onRowClick} />);

      const firstRow = screen.getAllByRole("row")[1];
      expect(firstRow).toHaveClass("cursor-pointer");
    });

    it("should render delete button when onRowDelete is provided", () => {
      const onRowDelete = vi.fn();
      render(<DataTable data={mockData} columns={defaultColumns} onRowDelete={onRowDelete} />);

      expect(screen.getByText("Actions")).toBeInTheDocument();
      const deleteButtons = screen.getAllByRole("button");
      expect(deleteButtons).toHaveLength(3); // One for each row
    });

    it("should call onRowDelete when delete button is clicked", async () => {
      const user = userEvent.setup();
      const onRowDelete = vi.fn();
      render(<DataTable data={mockData} columns={defaultColumns} onRowDelete={onRowDelete} />);

      const deleteButtons = screen.getAllByRole("button");
      await user.click(deleteButtons[0]); // Click first delete button

      expect(onRowDelete).toHaveBeenCalledWith(mockData[0]);
    });

    it("should not trigger onRowClick when delete button is clicked", async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();
      const onRowDelete = vi.fn();
      render(
        <DataTable
          data={mockData}
          columns={defaultColumns}
          onRowClick={onRowClick}
          onRowDelete={onRowDelete}
        />,
      );

      const deleteButtons = screen.getAllByRole("button");
      await user.click(deleteButtons[0]);

      expect(onRowDelete).toHaveBeenCalledTimes(1);
      expect(onRowClick).not.toHaveBeenCalled();
    });
  });

  describe("Custom Props", () => {
    it("should accept custom className", () => {
      const { container } = render(
        <DataTable data={mockData} columns={defaultColumns} className="custom-class" />,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should use custom page size", () => {
      const largeData = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        sourceUrl: `https://example.com/${i + 1}`,
        fieldData: {
          title: `Item ${i + 1}`,
          content: `Content ${i + 1}`,
        },
        extractedAt: new Date(),
        hash: `hash${i + 1}`,
        serviceId: "service1",
      }));

      render(<DataTable data={largeData} columns={defaultColumns} pageSize={5} />);

      expect(screen.getByText("Showing 1 to 5 of 10 entries")).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should work with search and pagination together", async () => {
      const user = userEvent.setup();
      const largeData = Array.from({ length: 15 }, (_, i) => ({
        id: `${i + 1}`,
        sourceUrl: `https://example.com/${i + 1}`,
        fieldData: {
          title: i < 5 ? `Special Item ${i + 1}` : `Regular Item ${i + 1}`,
          content: `Content ${i + 1}`,
        },
        extractedAt: new Date(),
        hash: `hash${i + 1}`,
        serviceId: "service1",
      }));

      render(<DataTable data={largeData} columns={defaultColumns} pageSize={3} />);

      // Search for "Special"
      const searchInput = screen.getByPlaceholderText("Search data...");
      await user.type(searchInput, "Special");

      // Should show filtered results with pagination
      expect(screen.getByText("Showing 1 to 3 of 5 entries")).toBeInTheDocument();
      expect(screen.getByText("Special Item 1")).toBeInTheDocument();
    });

    it("should work with search and sorting together", async () => {
      const user = userEvent.setup();
      render(<DataTable data={mockData} columns={defaultColumns} />);

      // Search for items
      const searchInput = screen.getByPlaceholderText("Search data...");
      await user.type(searchInput, "Item");

      // Sort by title
      const titleHeader = screen.getByText("Title").closest("th");
      expect(titleHeader).toBeInTheDocument();
      if (titleHeader) {
        await user.click(titleHeader);
      }

      // All items should still be visible and sorted
      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("First Item");
      expect(rows[2]).toHaveTextContent("Second Item");
      expect(rows[3]).toHaveTextContent("Third Item");
    });
  });
});
