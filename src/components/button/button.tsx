import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";
import { buttonVariants, type ButtonVariants } from "./button.variants";

export type ButtonProps = React.ComponentProps<"button"> &
  ButtonVariants & {
    asChild?: boolean;
    loading?: boolean;
    pressed?: boolean;
  };

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  pressed,
  onClick,
  children,
  ...props
}: ButtonProps) {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (loading) {
      // preventDefault is load-bearing for type="submit" inside a <form>:
      // Enter or programmatic .click() would otherwise submit during loading.
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const dataState = loading
    ? "loading"
    : pressed === undefined
      ? undefined
      : pressed
        ? "on"
        : "off";

  if (asChild) {
    return (
      <Slot
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={handleClick}
        {...props}
        aria-pressed={pressed}
        aria-busy={loading || undefined}
        aria-disabled={loading || undefined}
        data-state={dataState}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      // Cast: after destructuring above, `props` only contains HTML button
      // attributes, but TS can't narrow past the ButtonVariants intersection.
      {...(props as React.ComponentProps<"button">)}
      aria-pressed={pressed}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      data-state={dataState}
    >
      {loading ? (
        <Loader2
          data-slot="loader"
          aria-hidden="true"
          className="animate-spin size-4 shrink-0"
        />
      ) : null}
      {children}
    </button>
  );
}
