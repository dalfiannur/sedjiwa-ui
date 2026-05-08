import * as React from "react";
import type { FieldSurfaceVariants } from "../../lib/field-surface.variants";
import { Input } from "../input";
import {
  resolveCurrencyConfig,
  type CurrencyConfig,
  type CurrencyPresetKey,
} from "./currency-presets";
import { useCurrencyMask } from "./use-currency-mask";

const LEADING_ADDON_DISPLAY_NAME = "Input.LeadingAddon";

function getDisplayName(element: React.ReactElement): string | undefined {
  const t = element.type as { displayName?: string; name?: string } | string;
  if (typeof t === "string") return undefined;
  return t?.displayName ?? t?.name;
}

export type CurrencyInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  /** Preset key (`"IDR"`, `"USD"`) or full custom `CurrencyConfig`. */
  currency: CurrencyPresetKey | CurrencyConfig;
  /** Controlled numeric value. `null` represents an empty field. */
  value?: number | null;
  /** Uncontrolled initial value. */
  defaultValue?: number | null;
  /** Fires with the parsed numeric value (or `null` on empty). */
  onValueChange?: (value: number | null) => void;
  /** Override the resolved decimal places (preset/config default). */
  decimals?: number;
  /** Permit a leading `-`. Defaults to `false`. */
  allowNegative?: boolean;
  /** Hard clamp on blur (silent, no error UI). */
  min?: number;
  /** Hard clamp on blur (silent, no error UI). */
  max?: number;
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  loading?: boolean;
  /**
   * Escape hatch — appended inside `Input.Root` *after* the field. Use to attach
   * an `<Input.Action>` (clear button), an `<Input.TrailingIcon>`, or your own
   * `<Input.LeadingAddon>` (which suppresses the auto symbol).
   */
  children?: React.ReactNode;
  /** Suppress the auto leading-addon symbol (e.g., when the consumer renders their own). */
  hideSymbol?: boolean;
  /** Class for the outer `Input.Root` wrapper. */
  className?: string;
  /** Class for the inner `Input.Field`. */
  inputClassName?: string;
};

export function CurrencyInput(props: CurrencyInputProps) {
  const {
    currency,
    value,
    defaultValue,
    onValueChange,
    decimals,
    allowNegative = false,
    min,
    max,
    size,
    state,
    loading,
    disabled,
    readOnly,
    className,
    inputClassName,
    hideSymbol,
    children,
    // Pulled out so they land on Input.Root (FormControl Slot-cloning target),
    // not on Input.Field via the rest spread. Input.Root routes them via context.
    id,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    onBlur: consumerOnBlur,
    onFocus: consumerOnFocus,
    ...fieldProps
  } = props;

  const config = React.useMemo(
    () => resolveCurrencyConfig(currency, decimals),
    [currency, decimals],
  );

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<number | null>(
    defaultValue ?? null,
  );
  const currentValue = isControlled ? value! : internalValue;

  const { display, inputProps } = useCurrencyMask({
    value: currentValue,
    config,
    allowNegative,
    min,
    max,
    onValueChange: (n) => {
      if (!isControlled) setInternalValue(n);
      onValueChange?.(n);
    },
  });

  const consumerHasLeadingAddon = React.Children.toArray(children).some(
    (c) =>
      React.isValidElement(c) &&
      getDisplayName(c) === LEADING_ADDON_DISPLAY_NAME,
  );
  const showSymbol = !hideSymbol && !consumerHasLeadingAddon;

  return (
    <Input.Root
      size={size}
      state={state}
      loading={loading}
      disabled={disabled}
      // OR with `loading` so React doesn't warn about a `value` field without
      // `onChange` — `Input.Field` already strips `onChange` while loading, and
      // the input is semantically read-only during that window anyway.
      readOnly={readOnly || loading}
      id={id}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      className={className}
    >
      {showSymbol ? (
        <Input.LeadingAddon>{config.symbol}</Input.LeadingAddon>
      ) : null}
      <Input.Field
        type="text"
        {...fieldProps}
        {...inputProps}
        value={display}
        className={inputClassName}
        onFocus={(e) => {
          inputProps.onFocus(e);
          consumerOnFocus?.(e);
        }}
        onBlur={(e) => {
          inputProps.onBlur(e);
          consumerOnBlur?.(e);
        }}
      />
      {children}
    </Input.Root>
  );
}
CurrencyInput.displayName = "CurrencyInput";
