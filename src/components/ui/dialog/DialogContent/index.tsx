"use client";

import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";
import { DialogOverlay } from "../DialogOverlay";
import { DialogPortal } from "../DialogPortal";

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  /** Radix `Portal` の `container`。content script の Shadow 内へオーバーレイを出すときに指定。 */
  portalContainer?: HTMLElement | null;
  /**
   * `true` のとき、Radix `Dialog.Content` の `onInteractOutside` で `preventDefault()` し、
   * 外側でのポインタ・フォーカス等に起因する**既定の閉じ**を行わない（× や明示的な閉じ操作は従来どおり）。
   * @see https://www.radix-ui.com/primitives/docs/components/dialog （Content の `onInteractOutside`）
   */
  disableOutsideDismiss?: boolean;
};

function DialogContent({
  className,
  children,
  showCloseButton = true,
  portalContainer,
  disableOutsideDismiss = false,
  onInteractOutside,
  ...props
}: DialogContentProps) {
  const handleInteractOutside: NonNullable<
    React.ComponentProps<typeof DialogPrimitive.Content>["onInteractOutside"]
  > = (event) => {
    onInteractOutside?.(event);
    if (disableOutsideDismiss) {
      event.preventDefault();
    }
  };

  return (
    <DialogPortal data-slot="dialog-portal" container={portalContainer ?? undefined}>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg",
          className,
        )}
        {...props}
        onInteractOutside={
          disableOutsideDismiss || onInteractOutside ? handleInteractOutside : undefined
        }
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-4 right-4 rounded-xs border border-transparent opacity-70 outline-none ring-offset-background transition-all hover:opacity-100 active:scale-[0.96] active:opacity-100 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export type { DialogContentProps };
export { DialogContent };
