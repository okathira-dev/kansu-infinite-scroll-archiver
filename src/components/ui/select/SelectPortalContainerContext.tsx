"use client";

import { createContext, type ReactNode, useContext } from "react";

/**
 * Base UI `Select` の `Portal` の `container`。
 * content script の Shadow 内では `document.body` へ出すとスタイルが当たらないため、
 * Shadow 内のルート要素（例: WXT `createShadowRootUi` の `onMount` で渡る `container`）を渡す。
 */
const SelectPortalContainerContext = createContext<HTMLElement | ShadowRoot | null>(null);

function SelectPortalContainerProvider({
  children,
  value,
}: {
  children?: ReactNode;
  value: HTMLElement | ShadowRoot | null;
}) {
  return (
    <SelectPortalContainerContext.Provider value={value}>
      {children}
    </SelectPortalContainerContext.Provider>
  );
}

function useSelectPortalContainer() {
  return useContext(SelectPortalContainerContext);
}

export { SelectPortalContainerProvider, useSelectPortalContainer };
