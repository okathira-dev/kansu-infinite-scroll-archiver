"use client";

import { Select as SelectPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";
import { SelectScrollDownButton } from "../SelectScrollDownButton";
import { SelectScrollUpButton } from "../SelectScrollUpButton";

type SelectContentProps = React.ComponentProps<typeof SelectPrimitive.Content> & {
  /**
   * Radix `Portal` の `container`。未指定時は従来どおり（主に `document.body`）。
   * content script では Shadow 内のスタイルを当てるため、拡張UIルート配下の `HTMLElement` を渡す。
   */
  portalContainer?: HTMLElement | null;
  /** 内蔵の上スクロールボタンへ渡す props（Storybook や上書き用）。 */
  scrollUpButtonProps?: React.ComponentProps<typeof SelectScrollUpButton>;
  /** 内蔵の下スクロールボタンへ渡す props（Storybook や上書き用）。 */
  scrollDownButtonProps?: React.ComponentProps<typeof SelectScrollDownButton>;
};

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  portalContainer,
  scrollUpButtonProps,
  scrollDownButtonProps,
  ...props
}: SelectContentProps) {
  const content = (
    <SelectPrimitive.Content
      data-slot="select-content"
      className={cn(
        "relative z-50 max-h-(--radix-select-content-available-height) min-w-32 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      align={align}
      {...props}
    >
      <SelectScrollUpButton {...scrollUpButtonProps} />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton {...scrollDownButtonProps} />
    </SelectPrimitive.Content>
  );

  return (
    <SelectPrimitive.Portal container={portalContainer ?? undefined}>
      {content}
    </SelectPrimitive.Portal>
  );
}

export type { SelectContentProps };
export { SelectContent };
