import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  checkboxIndicatorIconVariants,
  checkboxVariants,
  type CheckboxVariants,
} from "./checkbox.variants";

export type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  size?: CheckboxVariants["size"];
  state?: CheckboxVariants["state"];
};

export function Checkbox({
  className,
  size = "default",
  state = "default",
  checked,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-size={size}
      data-state-tone={state}
      checked={checked}
      className={cn(checkboxVariants({ size, state }), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        {checked === "indeterminate" ? (
          <Minus className={checkboxIndicatorIconVariants({ size })} />
        ) : (
          <Check className={checkboxIndicatorIconVariants({ size })} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
