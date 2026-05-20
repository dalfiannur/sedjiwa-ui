import * as React from "react";
import { cn } from "../../lib/cn";

export type ComboboxListboxProps = {
  listboxId: string;
  className?: string;
  children?: React.ReactNode;
};

export function ComboboxListbox({
  listboxId,
  className,
  children,
}: ComboboxListboxProps) {
  return (
    <div
      data-slot="combobox-listbox-root"
      className={cn("flex flex-col", className)}
    >
      <ul
        id={listboxId}
        role="listbox"
        data-slot="combobox-listbox"
        className="max-h-60 overflow-y-auto p-1"
      >
        {children}
      </ul>
    </div>
  );
}
