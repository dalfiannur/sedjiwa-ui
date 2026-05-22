import type * as React from "react";

export type DynamicTabColor =
  | "default"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink";

export const DYNAMIC_TAB_COLORS: ReadonlyArray<DynamicTabColor> = [
  "default",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
] as const;

export type DynamicTabPosition = "top" | "bottom";

export type DynamicTabItem = {
  id: string;
  label: string;
  color?: DynamicTabColor;
  disabled?: boolean;
  closable?: boolean;
  renamable?: boolean;
};

export type DynamicTabProps = {
  tabs?: DynamicTabItem[];
  defaultTabs?: DynamicTabItem[];
  onTabsChange?: (tabs: DynamicTabItem[]) => void;

  activeTabId?: string;
  defaultActiveTabId?: string;
  onActiveTabChange?: (id: string) => void;

  position?: DynamicTabPosition;
  addable?: boolean;
  reorderable?: boolean;
  confirmDelete?: boolean;

  onAdd?: () => DynamicTabItem | Promise<DynamicTabItem>;
  onRename?: (id: string, label: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onColorChange?: (id: string, color: DynamicTabColor) => void;

  addLabel?: string;
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: (tab: DynamicTabItem) => React.ReactNode;
  deleteConfirmActionLabel?: string;
  deleteConfirmCancelLabel?: string;

  children?: React.ReactNode;
  className?: string;
};

export type DynamicTabPanelProps = {
  tabId: string;
  className?: string;
  children: React.ReactNode;
};
