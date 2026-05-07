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
  if (
    process.env.NODE_ENV !== "production" &&
    asChild &&
    loading &&
    !hasWarnedAsChildLoading
  ) {
    hasWarnedAsChildLoading = true;
    console.warn(
      "[sedjiwa-ui Button] `asChild` + `loading` does not inject a spinner into the slotted child. Render a spinner inside the slotted element if you need one."
    );
  }

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (loading) {
      // Block consumer onClick AND prevent native default — important for
      // type="submit" buttons inside a <form>, where Enter or programmatic
      // .click() would otherwise submit the form during loading.
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

let hasWarnedAsChildLoading = false;
