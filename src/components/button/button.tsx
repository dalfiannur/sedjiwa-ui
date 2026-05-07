import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";
import { buttonVariants, type ButtonVariants } from "./button.variants";

export type ButtonProps = React.ComponentProps<"button"> &
  ButtonVariants & {
    asChild?: boolean;
    pressed?: boolean;
  };

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  pressed,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  const stateAttrs: Record<string, string> = {};
  if (pressed !== undefined) {
    stateAttrs["aria-pressed"] = pressed ? "true" : "false";
    stateAttrs["data-state"] = pressed ? "on" : "off";
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...stateAttrs}
      {...props}
    />
  );
}
