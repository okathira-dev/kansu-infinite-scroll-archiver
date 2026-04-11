"use client";

import { Select as SelectPrimitive } from "radix-ui";
import type * as React from "react";

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

export { SelectGroup };
