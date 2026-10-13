import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "../../lib/cn";
import { filterChipGroupVariants, filterChipVariants } from "./filter-chip.variants";

export type FilterChipGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> & {
  /** Names the filter, e.g. "Saring menurut status". */
  "aria-label": string;
};

/**
 * A row of filter chips above a list.
 *
 * `type="single"` answers "which one?" (Terbuka / Selesai / Semua),
 * `type="multiple"` narrows by several at once (a chip per channel). Unlike
 * `SegmentedControl` this is not a form control — it filters what is already
 * on screen — and in `single` mode pressing the active chip clears it, as
 * Radix does, unless the caller ignores the empty value.
 *
 * An "all" chip that means "no filter" is a value like any other: map it to
 * an empty selection in `onValueChange` (see the story).
 */
export function FilterChipGroup({ className, ...props }: FilterChipGroupProps) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="filter-chip-group"
      className={cn(filterChipGroupVariants(), className)}
      {...props}
    />
  );
}

export type FilterChipProps = React.ComponentProps<typeof ToggleGroupPrimitive.Item> & {
  /** Leading mark, usually a colour dot or a glyph. Decorative. */
  icon?: React.ReactNode;
};

export function FilterChip({ className, icon, children, ...props }: FilterChipProps) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="filter-chip"
      className={cn(filterChipVariants(), className)}
      {...props}
    >
      {icon != null && (
        <span aria-hidden="true" className="contents">
          {icon}
        </span>
      )}
      {children}
    </ToggleGroupPrimitive.Item>
  );
}
