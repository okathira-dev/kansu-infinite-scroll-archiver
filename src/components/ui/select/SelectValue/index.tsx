"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";

function SelectValue({ ...props }: SelectPrimitive.Value.Props) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

export { SelectValue };
