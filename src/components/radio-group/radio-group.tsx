import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "../../lib/cn";
import {
  radioGroupItemIndicatorVariants,
  radioGroupItemVariants,
  type RadioGroupItemVariants,
} from "./radio-group.variants";

type RadioGroupContextValue = {
  size: NonNullable<RadioGroupItemVariants["size"]>;
  state: NonNullable<RadioGroupItemVariants["state"]>;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue>({
  size: "default",
  state: "default",
});

export type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root> & {
  size?: RadioGroupItemVariants["size"];
  state?: RadioGroupItemVariants["state"];
};

export function RadioGroup({
  className,
  size = "default",
  state = "default",
  ...props
}: RadioGroupProps) {
  const ctx = React.useMemo<RadioGroupContextValue>(
    () => ({ size: size ?? "default", state: state ?? "default" }),
    [size, state],
  );
  return (
    <RadioGroupContext.Provider value={ctx}>
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        data-size={size}
        data-state-tone={state}
        className={cn("grid gap-2", className)}
        {...props}
      />
    </RadioGroupContext.Provider>
  );
}

export type RadioGroupItemProps = React.ComponentProps<typeof RadioGroupPrimitive.Item>;

export function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  const { size, state } = React.useContext(RadioGroupContext);
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      data-size={size}
      className={cn(radioGroupItemVariants({ size, state }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex size-full items-center justify-center"
      >
        <span className={radioGroupItemIndicatorVariants({ size, state })} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}
