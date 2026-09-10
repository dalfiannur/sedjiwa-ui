import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "../../lib/cn";
import {
  segmentedControlItemVariants,
  segmentedControlVariants,
  type SegmentedControlVariants,
} from "./segmented-control.variants";

export type SegmentedControlItem = {
  value: string;
  label: React.ReactNode;
  /** Usually a lucide glyph, rendered before the label. Decorative. */
  icon?: React.ReactNode;
  disabled?: boolean;
};

export type SegmentedControlProps = Omit<
  React.ComponentProps<"div">,
  "onChange" | "defaultValue" | "dir"
> & {
  items: SegmentedControlItem[];
  /** Controlled selection. */
  value?: string;
  /** Uncontrolled initial selection. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Submits the selection with a plain `<form>` via a hidden input. */
  name?: string;
  disabled?: boolean;
  size?: SegmentedControlVariants["size"];
  orientation?: "horizontal" | "vertical";
  /** Stretch to the container and share the width evenly between segments. */
  fullWidth?: boolean;
  /** Class for the individual segments. */
  itemClassName?: string;
};

/**
 * A one-of-several choice rendered as a row of segments.
 *
 * This is a **form control**, not navigation — it answers "which of these?"
 * about the content below it and submits like a radio group. Reach for `Tabs`
 * when the segments swap panels instead.
 *
 * Built on Radix's toggle group for the roving tabindex: the whole control is
 * one tab stop and the arrow keys move between segments, which is what a
 * radio group is supposed to do and what a row of plain buttons gets wrong.
 */
export function SegmentedControl({
  items,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled,
  size = "default",
  orientation = "horizontal",
  fullWidth = false,
  className,
  itemClassName,
  ...props
}: SegmentedControlProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    defaultValue,
  );
  const current = isControlled ? value : internalValue;

  const handleValueChange = (next: string) => {
    // Radix clears the group when the pressed item was already on. A segmented
    // control has no "none" state — the question it asks always has an answer —
    // so an empty string here means "the user pressed the active segment", and
    // the right response is to leave the selection where it is.
    if (next === "") return;
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <>
      <ToggleGroupPrimitive.Root
        type="single"
        loop
        rovingFocus
        orientation={orientation}
        value={current ?? ""}
        onValueChange={handleValueChange}
        disabled={disabled}
        data-slot="segmented-control"
        data-orientation={orientation}
        className={cn(
          segmentedControlVariants({ size, orientation, fullWidth }),
          className,
        )}
        {...props}
      >
        {items.map((item) => (
          <ToggleGroupPrimitive.Item
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            data-slot="segmented-control-item"
            className={cn(
              segmentedControlItemVariants({ size, orientation, fullWidth }),
              itemClassName,
            )}
          >
            {item.icon ? (
              <span aria-hidden="true" className="contents">
                {item.icon}
              </span>
            ) : null}
            {item.label}
          </ToggleGroupPrimitive.Item>
        ))}
      </ToggleGroupPrimitive.Root>
      {name ? (
        <input type="hidden" name={name} value={current ?? ""} readOnly />
      ) : null}
    </>
  );
}
SegmentedControl.displayName = "SegmentedControl";
