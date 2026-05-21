import type * as React from "react";
import type { FieldSurfaceVariants } from "../../lib/field-surface.variants";

export type ComboboxOptionRenderState = {
  selected: boolean;
  active: boolean;
};

type ComboboxBaseProps<T> = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  options: T[];
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  isOptionDisabled?: (option: T) => boolean;
  renderOption?: (
    option: T,
    state: ComboboxOptionRenderState,
  ) => React.ReactNode;
  renderValue?: (selected: T | T[] | null) => React.ReactNode;

  searchable?: boolean;
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchChange?: (query: string) => void;
  filterFn?: (option: T, query: string) => boolean;
  searchDebounceMs?: number;

  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;

  creatable?: boolean;
  onCreate?: (query: string) => void;
  formatCreateLabel?: (query: string) => React.ReactNode;
  isValidNewOption?: (query: string, options: T[]) => boolean;
  createPosition?: "first" | "last";

  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: React.ReactNode;
  loadingMessage?: React.ReactNode;
  maxChips?: number;
  clearable?: boolean;

  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  disabled?: boolean;
  name?: string;
  className?: string;
};

export type ComboboxProps<T> =
  | (ComboboxBaseProps<T> & {
      multiple?: false;
      value?: string | null;
      defaultValue?: string | null;
      onValueChange?: (value: string | null) => void;
    })
  | (ComboboxBaseProps<T> & {
      multiple: true;
      value?: string[];
      defaultValue?: string[];
      onValueChange?: (value: string[]) => void;
    });
