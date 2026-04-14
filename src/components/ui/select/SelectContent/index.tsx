"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import type * as React from "react";

import { cn } from "@/lib/utils";
import { useSelectPortalContainer } from "../SelectPortalContainerContext";

type SelectContentProps = SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  > & {
    position?: "item-aligned" | "popper";
    disablePortal?: boolean;
    /**
     * Base UI `Portal` の `container`。未指定時は `SelectPortalContainerProvider` の値、
     * それもなければライブラリ既定（主に `document.body`）。
     */
    portalContainer?:
      | HTMLElement
      | ShadowRoot
      | React.RefObject<HTMLElement | ShadowRoot | null>
      | null;
  };

function resolvePortalContainerProp(
  value: SelectContentProps["portalContainer"],
): HTMLElement | ShadowRoot | undefined {
  if (value == null) {
    return undefined;
  }
  if (typeof value === "object" && "current" in value) {
    return value.current ?? undefined;
  }
  return value;
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger,
  disablePortal = false,
  portalContainer,
  ...popupProps
}: SelectContentProps) {
  const contextPortalContainer = useSelectPortalContainer();
  const resolvedPortalContainer =
    resolvePortalContainerProp(portalContainer) ?? contextPortalContainer ?? undefined;

  const content = (
    <SelectPrimitive.Positioner
      data-slot="select-positioner"
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      alignItemWithTrigger={alignItemWithTrigger ?? position === "item-aligned"}
      className={cn(
        "z-50 outline-none data-open:animate-in data-open:fade-in-0 data-open:duration-200 data-open:ease-out data-closed:animate-out data-closed:fade-out-0",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      )}
    >
      <SelectPrimitive.Popup
        data-slot="select-content"
        className={cn(
          "min-h-0 min-w-32 overflow-hidden overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
          position === "popper" && "w-full min-w-(--anchor-width) origin-(--transform-origin)",
          position === "item-aligned" && "origin-(--transform-origin)",
          className,
        )}
        {...(popupProps as SelectPrimitive.Popup.Props)}
      >
        <SelectPrimitive.List className="max-h-(--available-height) min-h-0 overflow-y-auto overscroll-y-contain p-1">
          {children}
        </SelectPrimitive.List>
      </SelectPrimitive.Popup>
    </SelectPrimitive.Positioner>
  );

  if (disablePortal) {
    return content;
  }

  return (
    <SelectPrimitive.Portal container={resolvedPortalContainer ?? undefined}>
      {content}
    </SelectPrimitive.Portal>
  );
}

export type { SelectContentProps };
export { SelectContent };
