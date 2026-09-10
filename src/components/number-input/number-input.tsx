import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/cn";
import { DEFAULT_LOCALE } from "../../lib/locale";
import { clampNumber } from "../../lib/number-mask";
import { useNumberMask } from "../../lib/use-number-mask";
import type { FieldSurfaceVariants } from "../../lib/field-surface.variants";
import { Input } from "../input";
import {
  numberInputControlsVariants,
  numberInputStepVariants,
} from "./number-input.variants";

const DEFAULT_INCREMENT_LABEL = "Naikkan";
const DEFAULT_DECREMENT_LABEL = "Turunkan";

export type NumberInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "size" | "step" | "min" | "max"
> & {
  /** Controlled numeric value. `null` represents an empty field. */
  value?: number | null;
  /** Uncontrolled initial value. */
  defaultValue?: number | null;
  /** Fires with the parsed numeric value (or `null` on empty). */
  onValueChange?: (value: number | null) => void;
  /** Decimal places kept. Extra digits are truncated, not rounded. Defaults to `0`. */
  decimals?: number;
  /** Render group separators. Off by default — a quantity is not money. */
  thousandSeparator?: boolean;
  /** BCP-47 tag deciding the group and decimal marks. */
  locale?: string;
  /** Permit a leading `-`. Defaults to `false`. */
  allowNegative?: boolean;
  min?: number;
  max?: number;
  /** Amount added or removed per step press. Defaults to `1`. */
  step?: number;
  /**
   * `"blur"` (default) quietly pulls an out-of-range value back inside on blur;
   * `"none"` reports whatever was typed and leaves the judgement to validation.
   * Stepping always respects the bounds either way.
   */
  clampBehavior?: "blur" | "none";
  /** Drop the up/down buttons. Arrow keys still step. */
  hideControls?: boolean;
  /** Accessible name for the up button. */
  incrementLabel?: string;
  /** Accessible name for the down button. */
  decrementLabel?: string;
  size?: FieldSurfaceVariants["size"];
  state?: FieldSurfaceVariants["state"];
  loading?: boolean;
  /** Appended inside `Input.Root` after the controls. */
  children?: React.ReactNode;
  /** Class for the outer `Input.Root` wrapper. */
  className?: string;
  /** Class for the inner `Input.Field`. */
  inputClassName?: string;
};

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === "function") ref(value);
  else if (ref != null)
    (ref as React.MutableRefObject<T | null>).current = value;
}

export function NumberInput(props: NumberInputProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    decimals = 0,
    thousandSeparator = false,
    locale = DEFAULT_LOCALE,
    allowNegative = false,
    min,
    max,
    step = 1,
    clampBehavior = "blur",
    hideControls = false,
    incrementLabel = DEFAULT_INCREMENT_LABEL,
    decrementLabel = DEFAULT_DECREMENT_LABEL,
    size = "default",
    state,
    loading,
    disabled,
    readOnly,
    className,
    inputClassName,
    children,
    // Pulled out so they land on Input.Root (FormControl Slot-cloning target),
    // not on Input.Field via the rest spread. Input.Root routes them via context.
    id,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    onBlur: consumerOnBlur,
    onFocus: consumerOnFocus,
    onKeyDown: consumerOnKeyDown,
    // Consumer ref must be merged with our internal ref (used for caret restoration).
    ref: consumerRef,
    ...fieldProps
  } = props;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<number | null>(
    defaultValue ?? null,
  );
  const currentValue = isControlled ? value! : internalValue;

  const internalInputRef = React.useRef<HTMLInputElement | null>(null);
  const mergedInputRef = React.useCallback(
    (el: HTMLInputElement | null) => {
      internalInputRef.current = el;
      setRef(consumerRef, el);
    },
    [consumerRef],
  );

  const commit = React.useCallback(
    (n: number | null) => {
      if (!isControlled) setInternalValue(n);
      onValueChange?.(n);
    },
    [isControlled, onValueChange],
  );

  const { display, inputProps } = useNumberMask({
    value: currentValue,
    locale,
    decimals,
    allowNegative,
    useGrouping: thousandSeparator,
    // Handing the mask no bounds is what makes `clampBehavior="none"` work:
    // the blur reflow is the only place it would apply them.
    min: clampBehavior === "blur" ? min : undefined,
    max: clampBehavior === "blur" ? max : undefined,
    onValueChange: commit,
    inputRef: internalInputRef,
  });

  // Step arithmetic runs in floats, so 0.2 + 0.1 lands on 0.30000000000000004
  // and the mask would render "0,3" over a value that is not 0.3. Snap back to
  // the precision the field claims to keep.
  const snap = (n: number): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(n * factor) / factor;
  };

  const atMax = max !== undefined && currentValue !== null && currentValue >= max;
  const atMin = min !== undefined && currentValue !== null && currentValue <= min;

  const stepBy = (direction: 1 | -1) => {
    if (disabled || readOnly || loading) return;
    // An empty field has no value to step from; the first press seeds it at the
    // bottom of the range rather than at "one step above nothing".
    const next =
      currentValue === null
        ? (min ?? 0)
        : snap(currentValue + direction * step);
    commit(clampNumber(next, min, max));
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    consumerOnKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      stepBy(1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      stepBy(-1);
    }
  };

  const controlsDisabled = disabled || readOnly || loading;

  return (
    <Input.Root
      size={size}
      state={state}
      loading={loading}
      disabled={disabled}
      // OR with `loading` so React doesn't warn about a `value` field without
      // `onChange` — `Input.Field` already strips `onChange` while loading.
      readOnly={readOnly || loading}
      id={id}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      className={className}
    >
      <Input.Field
        type="text"
        role="spinbutton"
        aria-valuenow={currentValue ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        {...fieldProps}
        {...inputProps}
        ref={mergedInputRef}
        value={display}
        className={inputClassName}
        onKeyDown={handleKeyDown}
        onFocus={(e) => {
          inputProps.onFocus(e);
          consumerOnFocus?.(e);
        }}
        onBlur={(e) => {
          inputProps.onBlur(e);
          consumerOnBlur?.(e);
        }}
      />
      {hideControls ? null : (
        <div
          data-slot="number-input-controls"
          className={cn(numberInputControlsVariants({ size }))}
        >
          <button
            type="button"
            data-slot="number-input-increment"
            // The spinbutton role already promises arrow keys, so the buttons
            // are a pointer affordance; keeping them out of the tab order
            // spares keyboard users two stops per numeric field.
            tabIndex={-1}
            aria-label={incrementLabel}
            disabled={controlsDisabled || atMax}
            onClick={() => stepBy(1)}
            className={cn(numberInputStepVariants({ side: "up", size }))}
          >
            <ChevronUp />
          </button>
          <button
            type="button"
            data-slot="number-input-decrement"
            tabIndex={-1}
            aria-label={decrementLabel}
            disabled={controlsDisabled || atMin}
            onClick={() => stepBy(-1)}
            className={cn(numberInputStepVariants({ side: "down", size }))}
          >
            <ChevronDown />
          </button>
        </div>
      )}
      {children}
    </Input.Root>
  );
}
NumberInput.displayName = "NumberInput";
