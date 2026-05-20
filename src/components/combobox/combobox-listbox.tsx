import * as React from "react";
import { Check } from "lucide-react";
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
  className?: string;
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
  className,
}: ComboboxListboxProps<T>) {
  return (
    <div
      data-slot="combobox-listbox-root"
      className={cn("flex flex-col", className)}
    >
      <ul
        id={listboxId}
        role="listbox"
        aria-multiselectable={multiple || undefined}
        data-slot="combobox-listbox"
        className="max-h-60 overflow-y-auto p-1"
      >
        {items.length === 0 ? (
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
                  // Prevent the search input (in a later task) from losing focus.
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
      </ul>
    </div>
  );
}
