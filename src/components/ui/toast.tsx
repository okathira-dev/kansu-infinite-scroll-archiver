import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
        success:
          "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200",
        warning:
          "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  onClose?: () => void;
  autoHideDuration?: number;
}

function Toast({
  className,
  variant,
  onClose,
  autoHideDuration = 5000,
  children,
  ...props
}: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // アニメーション時間を考慮
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn(toastVariants({ variant }), className)} data-state="open" {...props}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-md opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none"
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 300);
          }}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
}

interface ToastTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

function ToastTitle({ className, ...props }: ToastTitleProps) {
  return (
    <h3 className={cn("text-sm font-semibold leading-none tracking-tight", className)} {...props} />
  );
}

interface ToastDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  return <div className={cn("text-sm opacity-90 leading-relaxed", className)} {...props} />;
}

export { Toast, ToastTitle, ToastDescription, toastVariants, type ToastProps };
