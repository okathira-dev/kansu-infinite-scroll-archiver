import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const modalVariants = cva(
  "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
  {
    variants: {
      size: {
        sm: "max-w-md",
        default: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const overlayVariants = cva(
  "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
);

interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants> {
  isOpen: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

function Modal({
  className,
  size,
  isOpen,
  onClose,
  showCloseButton = true,
  closeOnOverlayClick = true,
  children,
  ...props
}: ModalProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Animate out
      setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = "";
      }, 200);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      {closeOnOverlayClick ? (
        <button
          type="button"
          className={cn(overlayVariants(), "cursor-default")}
          data-state={isOpen ? "open" : "closed"}
          onClick={onClose}
          aria-label="Close modal"
        />
      ) : (
        <div className={cn(overlayVariants())} data-state={isOpen ? "open" : "closed"} />
      )}

      {/* Modal Content */}
      <div
        className={cn(modalVariants({ size }), className)}
        data-state={isOpen ? "open" : "closed"}
        {...props}
      >
        {showCloseButton && (
          <button
            type="button"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

function ModalHeader({ className, ...props }: ModalHeaderProps) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    />
  );
}

interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

function ModalTitle({ className, ...props }: ModalTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  );
}

interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

function ModalDescription({ className, ...props }: ModalDescriptionProps) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function ModalContent({ className, ...props }: ModalContentProps) {
  return <div className={cn("flex-1", className)} {...props} />;
}

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
      {...props}
    />
  );
}

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  modalVariants,
  type ModalProps,
};
