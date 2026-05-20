import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { fieldSurfaceVariants } from "../../lib/field-surface.variants";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import {
  ComboboxListbox,
  type ComboboxListboxItem,
} from "./combobox-listbox";
import type { ComboboxProps } from "./combobox.types";

const DEFAULT_PLACEHOLDER = "Select…";
const DEFAULT_EMPTY_MESSAGE = "No results";
const DEFAULT_SEARCH_PLACEHOLDER = "Search…";

function asArrayValue(v: string | string[] | null | undefined): string[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function findOptionByValue<T>(
  options: T[],
  getOptionValue: (o: T) => string,
  value: string,
): T | undefined {
  return options.find((o) => getOptionValue(o) === value);
}

function defaultFilter<T>(
  option: T,
  query: string,
  getLabel: (o: T) => string,
): boolean {
  if (!query) return true;
  return getLabel(option).toLowerCase().includes(query.toLowerCase());
}

function ComboboxImpl<T>(
  props: ComboboxProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const {
    options,
    getOptionValue,
    getOptionLabel,
    isOptionDisabled,
    renderOption,
    multiple = false,
    value,
    defaultValue,
    onValueChange,
    searchable = true,
    searchValue: searchValueProp,
    defaultSearchValue,
    onSearchChange,
    filterFn,
    placeholder = DEFAULT_PLACEHOLDER,
    searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
    emptyMessage = DEFAULT_EMPTY_MESSAGE,
    size = "default",
    state = "default",
    disabled = false,
    className,
    id,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
  } = props;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<
    string | string[] | null
  >(() => {
    if (defaultValue !== undefined) return defaultValue;
    return multiple ? [] : null;
  });
  const currentValue = isControlled ? (value ?? null) : internalValue;
  const selectedValues = React.useMemo(
    () => asArrayValue(currentValue),
    [currentValue],
  );

  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    if (!searchable) return;
    const id = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open, searchable]);

  const listboxId = React.useId();
  const optionIdPrefix = `${listboxId}-opt`;

  const isSearchControlled = searchValueProp !== undefined;
  const [internalSearchValue, setInternalSearchValue] = React.useState(
    defaultSearchValue ?? "",
  );
  const searchValue = isSearchControlled
    ? (searchValueProp ?? "")
    : internalSearchValue;

  const isServerMode = onSearchChange !== undefined;

  const items: ComboboxListboxItem<T>[] = React.useMemo(() => {
    const filterPred = (option: T) => {
      if (isServerMode) return true;
      const fn = filterFn ?? ((o: T, q: string) => defaultFilter(o, q, getOptionLabel));
      return fn(option, searchValue);
    };
    return options
      .filter(filterPred)
      .map((option) => {
        const optionValue = getOptionValue(option);
        return {
          option,
          value: optionValue,
          label: getOptionLabel(option),
          selected: selectedValues.includes(optionValue),
          disabled: isOptionDisabled ? isOptionDisabled(option) : false,
        };
      });
  }, [
    options,
    getOptionValue,
    getOptionLabel,
    isOptionDisabled,
    selectedValues,
    filterFn,
    searchValue,
    isServerMode,
  ]);

  const commitValue = React.useCallback(
    (next: string | string[] | null) => {
      if (!isControlled) setInternalValue(next);
      if (multiple) {
        (onValueChange as ((v: string[]) => void) | undefined)?.(
          (next as string[] | null) ?? [],
        );
      } else {
        (onValueChange as ((v: string | null) => void) | undefined)?.(
          next as string | null,
        );
      }
    },
    [isControlled, multiple, onValueChange],
  );

  const handleSelectIndex = React.useCallback(
    (index: number) => {
      const item = items[index];
      if (!item || item.disabled) return;
      if (multiple) {
        const next = selectedValues.includes(item.value)
          ? selectedValues.filter((v) => v !== item.value)
          : [...selectedValues, item.value];
        commitValue(next);
      } else {
        commitValue(item.value);
        setOpen(false);
      }
    },
    [items, multiple, selectedValues, commitValue],
  );

  const handleSearchChange = React.useCallback(
    (next: string) => {
      if (!isSearchControlled) setInternalSearchValue(next);
      onSearchChange?.(next);
      setActiveIndex(0);
    },
    [isSearchControlled, onSearchChange],
  );

  const findNextEnabledIndex = React.useCallback(
    (from: number, dir: 1 | -1): number => {
      if (items.length === 0) return -1;
      let i = from;
      for (let n = 0; n < items.length; n++) {
        i = (i + dir + items.length) % items.length;
        if (!items[i]!.disabled) return i;
      }
      return -1;
    },
    [items],
  );

  const findFirstEnabledIndex = React.useCallback((): number => {
    for (let i = 0; i < items.length; i++) {
      if (!items[i]!.disabled) return i;
    }
    return -1;
  }, [items]);

  const findLastEnabledIndex = React.useCallback((): number => {
    for (let i = items.length - 1; i >= 0; i--) {
      if (!items[i]!.disabled) return i;
    }
    return -1;
  }, [items]);

  React.useEffect(() => {
    if (items.length === 0) {
      setActiveIndex(0);
      return;
    }
    setActiveIndex((prev) => {
      if (prev >= items.length || items[prev]?.disabled) {
        return Math.max(0, findFirstEnabledIndex());
      }
      return prev;
    });
  }, [items, findFirstEnabledIndex]);

  const handleSearchKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => {
          const next = findNextEnabledIndex(prev, 1);
          return next === -1 ? prev : next;
        });
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => {
          const next = findNextEnabledIndex(prev, -1);
          return next === -1 ? prev : next;
        });
      } else if (event.key === "Home") {
        event.preventDefault();
        const i = findFirstEnabledIndex();
        if (i !== -1) setActiveIndex(i);
      } else if (event.key === "End") {
        event.preventDefault();
        const i = findLastEnabledIndex();
        if (i !== -1) setActiveIndex(i);
      } else if (event.key === "Enter") {
        if (items.length === 0) return;
        event.preventDefault();
        handleSelectIndex(activeIndex);
      } else if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    },
    [
      findNextEnabledIndex,
      findFirstEnabledIndex,
      findLastEnabledIndex,
      items,
      activeIndex,
      handleSelectIndex,
    ],
  );

  const triggerContent = React.useMemo(() => {
    if (selectedValues.length === 0) {
      return (
        <span className="flex-1 truncate text-sm text-muted-foreground">
          {placeholder}
        </span>
      );
    }
    if (!multiple) {
      const v = selectedValues[0]!;
      const found = findOptionByValue(options, getOptionValue, v);
      const label = found ? getOptionLabel(found) : v;
      return <span className="flex-1 truncate text-sm">{label}</span>;
    }
    // Multi-mode chip rendering arrives in Task 5.
    return (
      <span className="flex-1 truncate text-sm">
        {selectedValues.length} selected
      </span>
    );
  }, [
    selectedValues,
    multiple,
    options,
    getOptionValue,
    getOptionLabel,
    placeholder,
  ]);

  const isEmpty = selectedValues.length === 0;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
        if (next) {
          setActiveIndex(Math.max(0, findFirstEnabledIndex()));
        } else {
          if (!isSearchControlled) setInternalSearchValue("");
        }
      }}
    >
      <PopoverTrigger
        ref={ref}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel ?? (isEmpty ? placeholder : undefined)}
        aria-describedby={ariaDescribedBy}
        aria-invalid={state === "error" ? true : ariaInvalid}
        disabled={disabled}
        data-slot="combobox-trigger"
        data-state={state}
        data-placeholder={isEmpty || undefined}
        className={cn(
          fieldSurfaceVariants({ size, state }),
          "items-center justify-between gap-2 px-3 text-left",
          className,
        )}
      >
        {triggerContent}
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-(--radix-popover-trigger-width) min-w-60 p-0"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <ComboboxListbox<T>
          listboxId={listboxId}
          multiple={multiple}
          items={items}
          emptyMessage={emptyMessage}
          activeIndex={activeIndex}
          onSelectIndex={handleSelectIndex}
          optionIdPrefix={optionIdPrefix}
          renderOption={renderOption}
          searchable={searchable}
          searchValue={searchValue}
          onSearchValueChange={handleSearchChange}
          searchPlaceholder={searchPlaceholder}
          searchInputRef={searchInputRef}
          onSearchKeyDown={handleSearchKeyDown}
          activeOptionId={
            items.length > 0
              ? `${optionIdPrefix}-${Math.min(activeIndex, items.length - 1)}`
              : undefined
          }
        />
      </PopoverContent>
    </Popover>
  );
}

export const Combobox = React.forwardRef(ComboboxImpl) as <T>(
  props: ComboboxProps<T> & { ref?: React.Ref<HTMLButtonElement> },
) => ReturnType<typeof ComboboxImpl>;

(Combobox as unknown as { displayName: string }).displayName = "Combobox";
