import * as React from "react";
import type { FieldSurfaceVariants } from "../../lib/field-surface.variants";
import { Combobox } from "../combobox";

const DEFAULT_PLACEHOLDER = "Belum ada label";
const DEFAULT_SEARCH_PLACEHOLDER = "Tambah label…";
const DEFAULT_EMPTY_MESSAGE = "Ketik untuk menambah label";

export type TagsInputProps = {
  /** Controlled list of tags. */
  value?: string[];
  /** Uncontrolled initial list. */
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /**
   * Tags offered before the user types anything. Optional — a tags input with
   * no suggestions is a perfectly ordinary free-text one.
   */
  suggestions?: string[];
  /** Text on the closed trigger while no tag is chosen. */
  placeholder?: string;
  /** Text in the search box inside the popover. */
  searchPlaceholder?: string;
  /** Shown when the query matches nothing and cannot be created either. */
  emptyMessage?: React.ReactNode;
  /** Tags rendered as chips before the rest collapse into a "+n more". */
  maxChips?: number;
  /** Offer a button that empties the list. */
  clearable?: boolean;
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  disabled?: boolean;
  name?: string;
  className?: string;
};

/**
 * Free-text tags on top of `<Combobox />`'s `multiple` + `creatable` modes.
 *
 * The one thing this adds over calling `Combobox` directly is folding the
 * current tags back into `options`. Combobox judges "can this be created?"
 * against the option list, so without the fold a tag the user already added
 * would be offered for creation a second time.
 */
export function TagsInput({
  value,
  defaultValue,
  onValueChange,
  suggestions,
  placeholder = DEFAULT_PLACEHOLDER,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  maxChips,
  clearable,
  size,
  state,
  disabled,
  name,
  className,
}: TagsInputProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string[]>(
    defaultValue ?? [],
  );
  const tags = isControlled ? value : internalValue;

  const commit = (next: string[]) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const options = React.useMemo(
    () => Array.from(new Set([...(suggestions ?? []), ...tags])),
    [suggestions, tags],
  );

  return (
    <Combobox<string>
      multiple
      creatable
      searchable
      options={options}
      getOptionValue={(o) => o}
      getOptionLabel={(o) => o}
      value={tags}
      onValueChange={commit}
      onCreate={(query) => {
        const tag = query.trim();
        if (!tag || tags.includes(tag)) return;
        commit([...tags, tag]);
      }}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      maxChips={maxChips}
      clearable={clearable}
      size={size}
      state={state}
      disabled={disabled}
      name={name}
      className={className}
    />
  );
}
TagsInput.displayName = "TagsInput";
