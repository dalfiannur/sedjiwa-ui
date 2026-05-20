import * as React from "react";
import { Check, Search } from "lucide-react";
import { cn } from "../../lib/cn";
import type { ComboboxOptionRenderState } from "./combobox.types";

export type ComboboxListboxItem<T> = {
  option: T;
  value: string;
  label: string;
  selected: boolean;
  disabled: boolean;
};

export type ComboboxListboxProps<T> = {
  listboxId: string;
  multiple: boolean;
  items: ComboboxListboxItem<T>[];
  emptyMessage: React.ReactNode;
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  optionIdPrefix: string;
  renderOption?: (
    option: T,
    state: ComboboxOptionRenderState,
  ) => React.ReactNode;
  searchable: boolean;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  searchPlaceholder: string;
  searchInputRef?: React.Ref<HTMLInputElement>;
  onSearchKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  activeOptionId?: string;
  className?: string;
  loading?: boolean;
  loadingMessage?: React.ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
};

export function ComboboxListbox<T>({
  listboxId,
  multiple,
  items,
  emptyMessage,
  activeIndex,
  onSelectIndex,
  optionIdPrefix,
  renderOption,
  searchable,
  searchValue,
  onSearchValueChange,
  searchPlaceholder,
  searchInputRef,
  onSearchKeyDown,
  activeOptionId,
  className,
  loading = false,
  loadingMessage,
  onLoadMore,
  hasMore = false,
}: ComboboxListboxProps<T>) {
  const sentinelRef = React.useRef<HTMLLIElement>(null);
  const onLoadMoreRef = React.useRef(onLoadMore);
  React.useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  React.useEffect(() => {
    if (!hasMore || loading || !onLoadMoreRef.current) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            onLoadMoreRef.current?.();
            break;
          }
        }
      },
      { rootMargin: "0px 0px 24px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, items.length]);

  return (
    <div
      data-slot="combobox-listbox-root"
      className={cn("flex flex-col", className)}
    >
      {searchable ? (
        <div
          data-slot="combobox-search"
          className="flex items-center gap-2 border-b px-3 py-2"
        >
          <Search
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <input
            ref={searchInputRef}
            type="text"
            role="combobox"
            aria-controls={listboxId}
            aria-expanded
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            value={searchValue}
            onChange={(e) => onSearchValueChange(e.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder={searchPlaceholder}
            data-slot="combobox-search-input"
            className={cn(
              "flex h-7 w-full bg-transparent text-sm outline-none",
              "placeholder:text-muted-foreground",
            )}
          />
        </div>
      ) : null}
      <ul
        id={listboxId}
        role="listbox"
        aria-multiselectable={multiple || undefined}
        data-slot="combobox-listbox"
        className="max-h-60 overflow-y-auto p-1"
      >
        {loading && items.length === 0 ? (
          <li
            role="status"
            aria-live="polite"
            data-slot="combobox-loading"
            className="px-2 py-1.5 text-sm text-muted-foreground"
          >
            {loadingMessage ?? "Loading…"}
          </li>
        ) : items.length === 0 ? (
          <li
            data-slot="combobox-empty"
            className="px-2 py-1.5 text-sm text-muted-foreground"
          >
            {emptyMessage}
          </li>
        ) : (
          items.map((item, index) => {
            const active = index === activeIndex;
            return (
              <li
                key={item.value}
                id={`${optionIdPrefix}-${index}`}
                role="option"
                aria-selected={item.selected}
                aria-disabled={item.disabled || undefined}
                data-slot="combobox-option"
                data-active={active || undefined}
                data-selected={item.selected || undefined}
                data-disabled={item.disabled || undefined}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => {
                  if (!item.disabled) onSelectIndex(index);
                }}
                className={cn(
                  "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm select-none",
                  "outline-none",
                  active && "bg-accent text-accent-foreground",
                  item.disabled && "pointer-events-none opacity-50",
                )}
              >
                {renderOption ? (
                  renderOption(item.option, {
                    selected: item.selected,
                    active,
                  })
                ) : (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {item.selected ? (
                  <span className="absolute right-2 flex size-3.5 items-center justify-center">
                    <Check className="size-4" />
                  </span>
                ) : null}
              </li>
            );
          })
        )}
        {items.length > 0 && loading ? (
          <li
            role="status"
            aria-live="polite"
            data-slot="combobox-loading-more"
            className="px-2 py-1.5 text-center text-xs text-muted-foreground"
          >
            {loadingMessage ?? "Loading…"}
          </li>
        ) : null}
        {hasMore && !loading ? (
          <li
            ref={sentinelRef}
            data-slot="combobox-sentinel"
            aria-hidden="true"
            className="h-px"
          />
        ) : null}
      </ul>
    </div>
  );
}
