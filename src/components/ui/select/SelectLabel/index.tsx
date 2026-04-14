"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";

import { cn } from "@/lib/utils";

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export { SelectLabel };
