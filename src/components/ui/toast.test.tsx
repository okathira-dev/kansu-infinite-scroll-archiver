import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toast, ToastDescription, ToastTitle } from "./toast";

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("Basic Functionality", () => {
    it("should render toast with content", () => {
      render(
        <Toast>
          <ToastTitle>Test Title</ToastTitle>
          <ToastDescription>Test Description</ToastDescription>
        </Toast>,
      );

      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });

    it("should render close button when onClose is provided", () => {
      const onClose = vi.fn();
      render(<Toast onClose={onClose}>Test Content</Toast>);

      expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
    });

    it("should not render close button when onClose is not provided", () => {
      render(<Toast>Test Content</Toast>);

      expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
    });
  });

  describe("Auto Hide Functionality", () => {
    it("should auto hide after default duration (5000ms)", async () => {
      const onClose = vi.fn();
      render(<Toast onClose={onClose}>Test Content</Toast>);

      expect(screen.getByText("Test Content")).toBeInTheDocument();

      // Fast-forward time by 5000ms
      vi.advanceTimersByTime(5000);

      // Wait for animation timeout (300ms)
      vi.advanceTimersByTime(300);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should auto hide after custom duration", async () => {
      const onClose = vi.fn();
      render(
        <Toast onClose={onClose} autoHideDuration={3000}>
          Test Content
        </Toast>,
      );

      vi.advanceTimersByTime(3000);
      vi.advanceTimersByTime(300); // Animation time

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not auto hide when autoHideDuration is 0", async () => {
      const onClose = vi.fn();
      render(
        <Toast onClose={onClose} autoHideDuration={0}>
          Test Content
        </Toast>,
      );

      vi.advanceTimersByTime(10000);

      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });
  });

  describe("Manual Close", () => {
    it.skip("should close when close button is clicked", async () => {
      // TODO: Fix fake timers + userEvent interaction
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <Toast onClose={onClose} autoHideDuration={0}>
          Test Content
        </Toast>,
      );

      const closeButton = screen.getByRole("button", { name: /close/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Variants", () => {
    it("should apply default variant", () => {
      const { container } = render(<Toast>Test Content</Toast>);
      const toast = container.firstChild as HTMLElement;

      expect(toast).toHaveClass("border", "bg-background", "text-foreground");
    });

    it("should apply success variant", () => {
      const { container } = render(<Toast variant="success">Test Content</Toast>);
      const toast = container.firstChild as HTMLElement;

      expect(toast).toHaveClass("border-green-200", "bg-green-50", "text-green-800");
    });

    it("should apply warning variant", () => {
      const { container } = render(<Toast variant="warning">Test Content</Toast>);
      const toast = container.firstChild as HTMLElement;

      expect(toast).toHaveClass("border-yellow-200", "bg-yellow-50", "text-yellow-800");
    });

    it("should apply info variant", () => {
      const { container } = render(<Toast variant="info">Test Content</Toast>);
      const toast = container.firstChild as HTMLElement;

      expect(toast).toHaveClass("border-blue-200", "bg-blue-50", "text-blue-800");
    });

    it("should apply destructive variant", () => {
      const { container } = render(<Toast variant="destructive">Test Content</Toast>);
      const toast = container.firstChild as HTMLElement;

      expect(toast).toHaveClass("destructive", "group", "border-destructive");
    });
  });

  describe("Subcomponents", () => {
    it("should render ToastTitle with proper styling", () => {
      render(<ToastTitle>Title Text</ToastTitle>);

      const title = screen.getByText("Title Text");
      expect(title).toHaveClass("text-sm", "font-semibold", "leading-none", "tracking-tight");
    });

    it("should render ToastDescription with proper styling", () => {
      render(<ToastDescription>Description Text</ToastDescription>);

      const description = screen.getByText("Description Text");
      expect(description).toHaveClass("text-sm", "opacity-90", "leading-relaxed");
    });

    it("should accept custom className for subcomponents", () => {
      render(
        <>
          <ToastTitle className="custom-title">Title</ToastTitle>
          <ToastDescription className="custom-description">Description</ToastDescription>
        </>,
      );

      expect(screen.getByText("Title")).toHaveClass("custom-title");
      expect(screen.getByText("Description")).toHaveClass("custom-description");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      const onClose = vi.fn();
      render(<Toast onClose={onClose}>Test Content</Toast>);

      const closeButton = screen.getByRole("button", { name: /close/i });
      expect(closeButton).toHaveAttribute("type", "button");
    });

    it("should have screen reader text for close button", () => {
      const onClose = vi.fn();
      render(<Toast onClose={onClose}>Test Content</Toast>);

      expect(screen.getByText("Close")).toHaveClass("sr-only");
    });
  });

  describe("Custom Props", () => {
    it("should accept custom className", () => {
      const { container } = render(<Toast className="custom-class">Test Content</Toast>);
      const toast = container.firstChild as HTMLElement;

      expect(toast).toHaveClass("custom-class");
    });

    it("should pass through additional props", () => {
      render(<Toast data-testid="custom-toast">Test Content</Toast>);

      expect(screen.getByTestId("custom-toast")).toBeInTheDocument();
    });
  });
});
