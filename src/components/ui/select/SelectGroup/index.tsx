"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";

function SelectGroup({ ...props }: SelectPrimitive.Group.Props) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

export { SelectGroup };
