"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";

type SelectProps = Omit<SelectPrimitive.Root.Props<string>, "onValueChange"> & {
  onValueChange?: (value: string) => void;
};

function Select({ modal = false, onValueChange, ...props }: SelectProps) {
  return (
    <SelectPrimitive.Root<string>
      data-slot="select"
      modal={modal}
      onValueChange={(value) => {
        if (typeof value !== "string") {
          return;
        }
        onValueChange?.(value);
      }}
      {...props}
    />
  );
}

export type { SelectProps };
export { Select };
