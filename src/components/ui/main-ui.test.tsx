import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ExtractedData } from "@/lib/types";
import { MainUI } from "./main-ui";

// Mock chrome API
const mockChrome = {
  runtime: {
    sendMessage: vi.fn(),
  },
};

// Mock data
const mockData: ExtractedData[] = [
  {
    id: "1",
    sourceUrl: "https://example.com/1",
    fieldData: {
      title: "First Item",
      content: "Content 1",
    },
    extractedAt: new Date("2024-01-01T00:00:00Z"),
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
    extractedAt: new Date("2024-01-02T00:00:00Z"),
    hash: "hash2",
    serviceId: "service2",
  },
];

describe("MainUI", () => {
  beforeEach(() => {
    // Mock chrome API
    (global as unknown as typeof globalThis & { chrome: typeof mockChrome }).chrome = mockChrome;

    // Reset mocks
    vi.clearAllMocks();

    // Mock successful data loading by default
    mockChrome.runtime.sendMessage.mockResolvedValue({
      success: true,
      data: mockData,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial Loading", () => {
    it("should show loading state initially", () => {
      // Mock pending promise
      mockChrome.runtime.sendMessage.mockReturnValue(new Promise(() => {}));

      render(<MainUI />);

      expect(screen.getByText("Loading data...")).toBeInTheDocument();
      expect(screen.getByRole("progressbar", { hidden: true })).toBeInTheDocument(); // RefreshCw with animate-spin
    });

    it("should load and display data on mount", async () => {
      render(<MainUI />);

      await waitFor(() => {
        expect(screen.getByText("Kansu Data Manager")).toBeInTheDocument();
      });

      expect(screen.getByText("First Item")).toBeInTheDocument();
      expect(screen.getByText("Second Item")).toBeInTheDocument();
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: "SEARCH_DATA",
        data: { query: "", limit: 1000, offset: 0 },
      });
    });

    it("should show error toast when data loading fails", async () => {
      mockChrome.runtime.sendMessage.mockResolvedValue({
        success: false,
      });

      render(<MainUI />);

      await waitFor(() => {
        expect(screen.getByText("Error")).toBeInTheDocument();
      });

      expect(screen.getByText("Failed to load data")).toBeInTheDocument();
    });

    it("should handle chrome API not available", async () => {
      (global as unknown as typeof globalThis & { chrome: unknown }).chrome = undefined;

      render(<MainUI />);

      await waitFor(() => {
        expect(screen.getByText("Kansu Data Manager")).toBeInTheDocument();
      });

      // Should fallback to empty data
      expect(screen.getByText("No data found")).toBeInTheDocument();
    });
  });

  describe("Header and Stats", () => {
    it("should display correct stats", async () => {
      render(<MainUI />);

      await waitFor(() => {
        expect(screen.getByText("Kansu Data Manager")).toBeInTheDocument();
      });

      expect(screen.getByText("2")).toBeInTheDocument(); // Total Items
      expect(screen.getByText("Total Items")).toBeInTheDocument();
      expect(screen.getByText("Services")).toBeInTheDocument();
      expect(screen.getByText("Last Updated")).toBeInTheDocument();
    });

    it("should show header buttons", async () => {
      render(<MainUI />);

      await waitFor(() => {
        expect(screen.getByText("Refresh")).toBeInTheDocument();
      });

      expect(screen.getByText("Export")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("should show close button when onClose is provided", async () => {
      const onClose = vi.fn();
      render(<MainUI onClose={onClose} />);

      await waitFor(() => {
        expect(screen.getByText("Close")).toBeInTheDocument();
      });
    });

    it("should disable export button when no data", async () => {
      mockChrome.runtime.sendMessage.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<MainUI />);

      await waitFor(() => {
        const exportButton = screen.getByText("Export");
        expect(exportButton).toBeDisabled();
      });
    });
  });

  describe("Refresh Functionality", () => {
    it("should refresh data when refresh button is clicked", async () => {
      const user = userEvent.setup();
      render(<MainUI />);

      await waitFor(() => {
        expect(screen.getByText("Refresh")).toBeInTheDocument();
      });

      const refreshButton = screen.getByText("Refresh");
      await user.click(refreshButton);

      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledTimes(2); // Initial load + refresh

      await waitFor(() => {
        expect(screen.getByText("Refreshed")).toBeInTheDocument();
      });
    });
  });

  describe("Export Functionality", () => {
    beforeEach(() => {
      // Mock DOM APIs for export
      global.URL.createObjectURL = vi.fn(() => "blob:url");
      global.URL.revokeObjectURL = vi.fn();

      // Mock document.createElement and appendChild
      const mockAnchor = {
        href: "",
        download: "",
        click: vi.fn(),
      };
      vi.spyOn(document, "createElement").mockReturnValue(mockAnchor as unknown as HTMLElement);
      vi.spyOn(document.body, "appendChild").mockImplementation(
        () => mockAnchor as unknown as HTMLElement,
      );
      vi.spyOn(document.body, "removeChild").mockImplementation(
        () => mockAnchor as unknown as HTMLElement,
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should export data when export button is clicked", async () => {
      const user = userEvent.setup();
      render(<MainUI />);

      await waitFor(() => {
        expect(screen.getByText("Export")).toBeInTheDocument();
      });

      const exportButton = screen.getByText("Export");
      await user.click(exportButton);

      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: "EXPORT_DATA",
        data: { format: "json" },
      });

      await waitFor(() => {
        expect(screen.getByText("Exported")).toBeInTheDocument();
      });
    });

    it("should show error toast when export fails", async () => {
      const user = userEvent.setup();

      // Mock export failure after initial successful load
      mockChrome.runtime.sendMessage.mockImplementation((message) => {
        if (message.type === "EXPORT_DATA") {
          return Promise.resolve({ success: false });
        }
        return Promise.resolve({ success: true, data: mockData });
      });

      render(<MainUI />);

      await waitFor(() => {
        expect(screen.getByText("Export")).toBeInTheDocument();
      });

      const exportButton = screen.getByText("Export");
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText("Error")).toBeInTheDocument();
      });

      expect(screen.getByText("Failed to export data")).toBeInTheDocument();
    });
  });

  describe("Delete Functionality", () => {
    it("should open delete modal when delete button is clicked", async () => {
      const user = userEvent.setup();
      render(<MainUI />);

      await waitFor(() => {
        expect(screen.getByText("First Item")).toBeInTheDocument();
      });

      // Find and click the first delete button
      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find((btn) =>
        btn.querySelector("svg")?.classList.contains("lucide-x"),
      );

      expect(deleteButton).toBeInTheDocument();
      if (deleteButton) {
        await user.click(deleteButton);
      }

      expect(screen.getByText("Delete Item")).toBeInTheDocument();
      expect(screen.getByText("Are you sure you want to delete this item?")).toBeInTheDocument();
    });

    it("should close delete modal when cancel is clicked", async () => {
      const user = userEvent.setup();
      render(<MainUI />);

      await waitFor(() => {
        expect(screen.getByText("First Item")).toBeInTheDocument();
      });

      // Open delete modal
      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find((btn) =>
        btn.querySelector("svg")?.classList.contains("lucide-x"),
      );

      expect(deleteButton).toBeInTheDocument();
      if (deleteButton) {
        await user.click(deleteButton);
      }

      // Click cancel
      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(screen.queryByText("Delete Item")).not.toBeInTheDocument();
    });

    it("should delete item when delete is confirmed", async () => {
      const user = userEvent.setup();

      // Mock delete success
      mockChrome.runtime.sendMessage.mockImplementation((message) => {
        if (message.type === "DELETE_DATA") {
          return Promise.resolve({ success: true });
        }
        return Promise.resolve({ success: true, data: mockData });
      });

      render(<MainUI />);

      await waitFor(() => {
        expect(screen.getByText("First Item")).toBeInTheDocument();
      });

      // Open delete modal
      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find((btn) =>
        btn.querySelector("svg")?.classList.contains("lucide-x"),
      );

      expect(deleteButton).toBeInTheDocument();
      if (deleteButton) {
        await user.click(deleteButton);
      }

      // Confirm delete
      const confirmDeleteButton = screen.getByRole("button", { name: /delete/i });
      await user.click(confirmDeleteButton);

      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: "DELETE_DATA",
        data: { id: "1" },
      });

      await waitFor(() => {
        expect(screen.getByText("Deleted")).toBeInTheDocument();
      });
    });

    it("should show error toast when delete fails", async () => {
      const user = userEvent.setup();

      // Mock delete failure
      mockChrome.runtime.sendMessage.mockImplementation((message) => {
        if (message.type === "DELETE_DATA") {
          return Promise.resolve({ success: false });
        }
        return Promise.resolve({ success: true, data: mockData });
      });

      render(<MainUI />);

      await waitFor(() => {
        expect(screen.getByText("First Item")).toBeInTheDocument();
      });

      // Open delete modal and confirm
      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find((btn) =>
        btn.querySelector("svg")?.classList.contains("lucide-x"),
      );

      expect(deleteButton).toBeInTheDocument();
      if (deleteButton) {
        await user.click(deleteButton);
      }

      const confirmDeleteButton = screen.getByRole("button", { name: /delete/i });
      await user.click(confirmDeleteButton);

      await waitFor(() => {
        expect(screen.getByText("Error")).toBeInTheDocument();
      });

      expect(screen.getByText("Failed to delete item")).toBeInTheDocument();
    });
  });

  describe("Close Functionality", () => {
    it("should call onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<MainUI onClose={onClose} />);

      await waitFor(() => {
        expect(screen.getByText("Close")).toBeInTheDocument();
      });

      const closeButton = screen.getByText("Close");
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Data Display", () => {
    it("should display formatted data correctly", async () => {
      render(<MainUI />);

      await waitFor(() => {
        expect(screen.getByText("First Item")).toBeInTheDocument();
      });

      // Check for formatted elements
      expect(screen.getByText("example.com")).toBeInTheDocument(); // Formatted URL
      expect(screen.getByText("service1")).toBeInTheDocument(); // Service badge
      expect(screen.getByText("service2")).toBeInTheDocument(); // Service badge
    });

    it("should show empty state when no data", async () => {
      mockChrome.runtime.sendMessage.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<MainUI />);

      await waitFor(() => {
        expect(screen.getByText("No data found")).toBeInTheDocument();
      });

      expect(screen.getByText("0")).toBeInTheDocument(); // Total Items should be 0
    });
  });

  describe("Custom Props", () => {
    it("should accept custom className", async () => {
      const { container } = render(<MainUI className="custom-class" />);

      await waitFor(() => {
        expect(container.firstChild).toHaveClass("custom-class");
      });
    });
  });
});
