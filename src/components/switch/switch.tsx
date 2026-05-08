import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  switchThumbVariants,
  switchVariants,
  type SwitchVariants,
} from "./switch.variants";

export type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: SwitchVariants["size"];
  state?: SwitchVariants["state"];
  loading?: boolean;
};

export function Switch({
  className,
  size = "default",
  state = "default",
  loading = false,
  disabled,
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      data-state-tone={state}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(switchVariants({ size, state }), className)}
      {...props}
    >
      {loading ? (
        <span
          data-slot="switch-loading"
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center text-primary-foreground"
        >
          <Loader2
            className={cn(
              "animate-spin",
              size === "sm" ? "size-2.5" : "size-3",
            )}
          />
        </span>
      ) : (
        <SwitchPrimitive.Thumb
          data-slot="switch-thumb"
          className={switchThumbVariants({ size })}
        />
      )}
    </SwitchPrimitive.Root>
  );
}
