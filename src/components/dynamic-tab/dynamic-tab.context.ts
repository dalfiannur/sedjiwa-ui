import * as React from "react";
import type {
  DynamicTabColor,
  DynamicTabItem,
  DynamicTabPosition,
} from "./dynamic-tab.types";

export type DynamicTabContextValue = {
  tabs: DynamicTabItem[];
  activeId: string | undefined;
  position: DynamicTabPosition;
  reorderable: boolean;
  addable: boolean;
  renameId: string | null;

  setActive: (id: string) => void;
  addTab: () => void;
  startRename: (id: string) => void;
  commitRename: (id: string, label: string) => void;
  cancelRename: () => void;
  requestDelete: (id: string) => void;
  duplicateTab: (id: string) => void;
  setTabColor: (id: string, color: DynamicTabColor) => void;
  reorder: (fromId: string, toId: string) => void;
};

export const DynamicTabContext = React.createContext<DynamicTabContextValue | null>(null);

export function useDynamicTabContext(): DynamicTabContextValue {
  const ctx = React.useContext(DynamicTabContext);
  if (!ctx) {
    throw new Error(
      "useDynamicTabContext must be used inside a <DynamicTab> component",
    );
  }
  return ctx;
}
