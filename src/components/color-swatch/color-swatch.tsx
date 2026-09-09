import * as React from "react";
import { cn } from "../../lib/cn";
import {
  colorSwatchVariants,
  colorSwatchListVariants,
  type ColorSwatchVariants,
  type ColorSwatchListVariants,
} from "./color-swatch.variants";

export type ColorSwatchListProps = React.ComponentProps<"ul"> &
  ColorSwatchListVariants & {
    /** What the row of colours is. Required, and spoken: "Warna tersedia,
     *  daftar, 3 item". */
    label: string;
  };

/** A row of colours that are the information, not an illustration of it.
 *
 *  This is the inverse of `ChartLegend`, and the difference is the whole
 *  reason the component exists. There, the dot sits beside a label that is
 *  already spoken, so the dot is `aria-hidden` — announcing it would repeat
 *  the entry. Here there is no label anywhere on screen: the colour IS the
 *  content. Hide these dots and the column becomes silence, which is how a
 *  hand-rolled version of this fails — it looks finished and says nothing.
 *
 *  So every swatch carries its own name, and the list carries one for the set.
 *  If you find yourself wanting a swatch without a name, what you have is
 *  decoration; style a `div` instead. */
export function ColorSwatchList({
  className,
  size,
  label,
  children,
  ...props
}: ColorSwatchListProps) {
  return (
    <ul
      data-slot="color-swatch-list"
      // Flex strips the implicit list semantics in Safari and VoiceOver, so
      // the role is stated rather than assumed.
      role="list"
      aria-label={label}
      className={cn(colorSwatchListVariants({ size }), className)}
      {...props}
    >
      {children}
    </ul>
  );
}

export type ColorSwatchProps = Omit<React.ComponentProps<"li">, "color"> &
  ColorSwatchVariants & {
    /** Any CSS colour. Product colours come from data, not from our tokens,
     *  so this is a raw value and not a token name. */
    color: string;
    /** What this colour is called, in the reader's language. Spoken, and shown
     *  on hover. There is no default: a swatch nobody can name is not one this
     *  component will render. */
    name: string;
  };

export function ColorSwatch({
  className,
  size,
  color,
  name,
  style,
  ...props
}: ColorSwatchProps) {
  return (
    <li
      data-slot="color-swatch"
      title={name}
      className={cn(colorSwatchVariants({ size }), className)}
      style={{ backgroundColor: color, ...style }}
      {...props}
    >
      {/* The name lives inside the dot rather than beside it: `sr-only` takes
          it out of the flow entirely, so the swatch stays a circle while its
          accessible name comes from its own contents. */}
      <span className="sr-only">{name}</span>
    </li>
  );
}
