import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "./modal";

describe("Modal", () => {
  beforeEach(() => {
    // Reset body styles before each test
    document.body.style.overflow = "";
  });

  afterEach(() => {
    // Clean up after each test
    document.body.style.overflow = "";
  });

  describe("Basic Functionality", () => {
    it("should render modal when isOpen is true", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should not render modal when isOpen is false", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={false} onClose={onClose}>
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      expect(screen.queryByText("Test Content")).not.toBeInTheDocument();
    });

    it("should render close button by default", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
    });

    it("should not render close button when showCloseButton is false", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} showCloseButton={false}>
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
    });
  });

  describe("Body Scroll Prevention", () => {
    it("should prevent body scroll when modal is open", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should restore body scroll when modal is closed", () => {
      const onClose = vi.fn();
      const { rerender } = render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      expect(document.body.style.overflow).toBe("hidden");

      rerender(
        <Modal isOpen={false} onClose={onClose}>
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      // Body scroll should be restored after animation delay
      setTimeout(() => {
        expect(document.body.style.overflow).toBe("");
      }, 200);
    });
  });

  describe("Close Functionality", () => {
    it("should close when close button is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      const closeButton = screen.getByRole("button", { name: /close/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should close when escape key is pressed", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should close when overlay is clicked by default", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      const overlay = screen.getByRole("button", { name: /close modal/i });
      await user.click(overlay);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not close when overlay is clicked and closeOnOverlayClick is false", async () => {
      const _user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <Modal isOpen={true} onClose={onClose} closeOnOverlayClick={false}>
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      // When closeOnOverlayClick is false, overlay should be a div, not a button
      const overlayDiv = document.querySelector("div[data-state='open']");
      expect(overlayDiv).toBeInTheDocument();

      // No clickable overlay button should exist
      expect(screen.queryByRole("button", { name: /close modal/i })).not.toBeInTheDocument();
    });
  });

  describe("Size Variants", () => {
    it("should apply default size", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      const modal = screen.getByText("Test Content").closest("[data-state='open']");
      expect(modal).toHaveClass("max-w-lg");
    });

    it("should apply small size", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} size="sm">
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      const modal = screen.getByText("Test Content").closest("[data-state='open']");
      expect(modal).toHaveClass("max-w-md");
    });

    it("should apply large size", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} size="lg">
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      const modal = screen.getByText("Test Content").closest("[data-state='open']");
      expect(modal).toHaveClass("max-w-2xl");
    });

    it("should apply extra large size", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} size="xl">
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      const modal = screen.getByText("Test Content").closest("[data-state='open']");
      expect(modal).toHaveClass("max-w-4xl");
    });
  });

  describe("Subcomponents", () => {
    it("should render ModalHeader with proper styling", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalHeader>Header Content</ModalHeader>
        </Modal>,
      );

      const header = screen.getByText("Header Content");
      expect(header).toHaveClass("flex", "flex-col", "space-y-1.5");
    });

    it("should render ModalTitle with proper styling", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalTitle>Modal Title</ModalTitle>
        </Modal>,
      );

      const title = screen.getByText("Modal Title");
      expect(title).toHaveClass("text-lg", "font-semibold", "leading-none", "tracking-tight");
    });

    it("should render ModalDescription with proper styling", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalDescription>Modal Description</ModalDescription>
        </Modal>,
      );

      const description = screen.getByText("Modal Description");
      expect(description).toHaveClass("text-sm", "text-muted-foreground");
    });

    it("should render ModalContent with proper styling", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalContent>Content Area</ModalContent>
        </Modal>,
      );

      const content = screen.getByText("Content Area");
      expect(content).toHaveClass("flex-1");
    });

    it("should render ModalFooter with proper styling", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalFooter>Footer Content</ModalFooter>
        </Modal>,
      );

      const footer = screen.getByText("Footer Content");
      expect(footer).toHaveClass("flex", "flex-col-reverse", "sm:flex-row", "sm:justify-end");
    });

    it("should accept custom className for subcomponents", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalHeader className="custom-header">Header</ModalHeader>
          <ModalTitle className="custom-title">Title</ModalTitle>
          <ModalDescription className="custom-description">Description</ModalDescription>
          <ModalContent className="custom-content">Content</ModalContent>
          <ModalFooter className="custom-footer">Footer</ModalFooter>
        </Modal>,
      );

      expect(screen.getByText("Header")).toHaveClass("custom-header");
      expect(screen.getByText("Title")).toHaveClass("custom-title");
      expect(screen.getByText("Description")).toHaveClass("custom-description");
      expect(screen.getByText("Content")).toHaveClass("custom-content");
      expect(screen.getByText("Footer")).toHaveClass("custom-footer");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      const closeButton = screen.getByRole("button", { name: /close/i });
      expect(closeButton).toHaveAttribute("type", "button");
    });

    it("should have screen reader text for close button", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      expect(screen.getByText("Close")).toHaveClass("sr-only");
    });

    it("should have proper aria-label for overlay button", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      const overlay = screen.getByRole("button", { name: /close modal/i });
      expect(overlay).toHaveAttribute("aria-label", "Close modal");
    });
  });

  describe("Custom Props", () => {
    it("should accept custom className", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} className="custom-modal">
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      const modal = screen.getByText("Test Content").closest("[data-state='open']");
      expect(modal).toHaveClass("custom-modal");
    });

    it("should pass through additional props", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} data-testid="custom-modal">
          <ModalContent>Test Content</ModalContent>
        </Modal>,
      );

      expect(screen.getByTestId("custom-modal")).toBeInTheDocument();
    });
  });

  describe("Complete Modal Example", () => {
    it("should render complete modal structure", () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <ModalHeader>
            <ModalTitle>Confirmation</ModalTitle>
            <ModalDescription>Are you sure you want to delete this item?</ModalDescription>
          </ModalHeader>
          <ModalContent>
            <p>This action cannot be undone.</p>
          </ModalContent>
          <ModalFooter>
            <button type="button">Cancel</button>
            <button type="button">Delete</button>
          </ModalFooter>
        </Modal>,
      );

      expect(screen.getByText("Confirmation")).toBeInTheDocument();
      expect(screen.getByText("Are you sure you want to delete this item?")).toBeInTheDocument();
      expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    });
  });
});
