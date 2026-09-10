import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../../lib/cn";
import {
  sliderRangeVariants,
  sliderThumbVariants,
  sliderTrackVariants,
  sliderVariants,
  type SliderThumbVariants,
} from "./slider.variants";

export type SliderMark = {
  value: number;
  /** Rendered under the mark. Omit for a bare tick. */
  label?: React.ReactNode;
};

/** A single value, or the two ends of a range. */
export type SliderValue = number | [number, number];

export type SliderProps = Omit<
  React.ComponentProps<typeof SliderPrimitive.Root>,
  "value" | "defaultValue" | "onValueChange" | "onValueCommit" | "asChild"
> & {
  /** Controlled value. A tuple turns the slider into a range with two thumbs. */
  value?: SliderValue;
  /** Uncontrolled initial value. */
  defaultValue?: SliderValue;
  /** Fires on every move, in the same shape the value came in. */
  onValueChange?: (value: SliderValue) => void;
  /** Fires once the user lets go — the one to hit a server with. */
  onValueCommit?: (value: SliderValue) => void;
  /** Ticks along the track, with optional labels beneath. */
  marks?: SliderMark[];
  /**
   * Show the current value in a bubble above the thumb. `true` prints the raw
   * number; pass a function to format it.
   */
  label?: boolean | ((value: number) => React.ReactNode);
  /**
   * Accessible name per thumb. A range needs two — "Harga" alone leaves a
   * screen reader announcing the same name for both ends.
   */
  thumbLabels?: string[];
  size?: SliderThumbVariants["size"];
  /** Class for the track. */
  trackClassName?: string;
  /** Class for the thumbs. */
  thumbClassName?: string;
};

function toArray(v: SliderValue | undefined): number[] | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? [...v] : [v];
}

export function Slider({
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  marks,
  label = false,
  thumbLabels,
  size = "default",
  min = 0,
  max = 100,
  step = 1,
  orientation = "horizontal",
  className,
  trackClassName,
  thumbClassName,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: SliderProps) {
  const arrayValue = toArray(value);
  const arrayDefault = toArray(defaultValue);

  // A tuple in means a tuple out. The caller decided the shape; reporting a
  // bare number back from a range (or an array back from a single) would make
  // every consumer re-derive what it already knew.
  const isRange = Array.isArray(value ?? defaultValue ?? 0);

  const reshape = (next: number[]): SliderValue =>
    isRange ? [next[0]!, next[1]!] : next[0]!;

  // Uncontrolled sliders still need the current value to place the bubbles and
  // fill the marks, so mirror what Radix reports.
  const [internal, setInternal] = React.useState<number[]>(
    arrayDefault ?? arrayValue ?? [min],
  );
  const current = arrayValue ?? internal;

  const thumbCount = current.length;
  const lo = Math.min(...current);
  const hi = Math.max(...current);

  const renderLabel = (v: number): React.ReactNode => {
    if (label === false) return null;
    return typeof label === "function" ? label(v) : String(v);
  };

  const positionOf = (v: number): string => {
    const span = max - min;
    if (span <= 0) return "0%";
    const pct = ((v - min) / span) * 100;
    return `${Math.min(100, Math.max(0, pct))}%`;
  };

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      min={min}
      max={max}
      step={step}
      orientation={orientation}
      value={arrayValue}
      defaultValue={arrayDefault}
      onValueChange={(next) => {
        if (arrayValue === undefined) setInternal(next);
        onValueChange?.(reshape(next));
      }}
      onValueCommit={
        onValueCommit ? (next) => onValueCommit(reshape(next)) : undefined
      }
      className={cn(
        sliderVariants({ orientation }),
        marks?.some((m) => m.label !== undefined) &&
          orientation === "horizontal" &&
          "mb-6",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          sliderTrackVariants({ orientation, size }),
          trackClassName,
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(sliderRangeVariants({ orientation }))}
        />
      </SliderPrimitive.Track>

      {marks?.map((mark) => {
        const filled = isRange
          ? mark.value >= lo && mark.value <= hi
          : mark.value <= hi;
        const offset = positionOf(mark.value);
        return (
          <span
            key={mark.value}
            data-slot="slider-mark"
            data-state={filled ? "filled" : "empty"}
            aria-hidden="true"
            style={
              orientation === "horizontal"
                ? { left: offset }
                : { bottom: offset }
            }
            className={cn(
              "pointer-events-none absolute",
              orientation === "horizontal"
                ? "-translate-x-1/2"
                : "translate-y-1/2",
            )}
          >
            <span
              className={cn(
                "block size-1.5 rounded-full",
                filled ? "bg-primary" : "bg-muted-foreground/40",
              )}
            />
            {mark.label !== undefined ? (
              <span
                data-slot="slider-mark-label"
                className={cn(
                  "text-muted-foreground absolute text-xs whitespace-nowrap",
                  orientation === "horizontal"
                    ? "top-3 left-1/2 -translate-x-1/2"
                    : "top-1/2 left-4 -translate-y-1/2",
                )}
              >
                {mark.label}
              </span>
            ) : null}
          </span>
        );
      })}

      {Array.from({ length: thumbCount }, (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          data-slot="slider-thumb"
          aria-label={thumbLabels?.[i] ?? (thumbCount === 1 ? ariaLabel : undefined)}
          aria-labelledby={thumbLabels?.[i] ? undefined : ariaLabelledBy}
          className={cn(sliderThumbVariants({ size }), thumbClassName)}
        >
          {label !== false ? (
            <span
              data-slot="slider-bubble"
              aria-hidden="true"
              className={cn(
                "bg-foreground text-background pointer-events-none absolute rounded px-1.5 py-0.5 text-xs whitespace-nowrap",
                orientation === "horizontal"
                  ? "bottom-full left-1/2 mb-1.5 -translate-x-1/2"
                  : "left-full top-1/2 ml-1.5 -translate-y-1/2",
              )}
            >
              {renderLabel(current[i]!)}
            </span>
          ) : null}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  );
}
Slider.displayName = "Slider";
