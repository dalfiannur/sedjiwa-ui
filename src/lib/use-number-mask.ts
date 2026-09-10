import * as React from "react";
import {
  caretPosForSignificantCount,
  clampNumber,
  countSignificantBefore,
  deriveSeparators,
  formatLive,
  formatNumber,
  numberToRawForEdit,
  parseAndTruncate,
  sanitizeForEditing,
} from "./number-mask";

export type UseNumberMaskOptions = {
  value: number | null | undefined;
  /** BCP-47 tag. Decides the group and decimal marks. */
  locale: string;
  decimals: number;
  allowNegative: boolean;
  /** Render group separators. `<CurrencyInput />` always does; `<NumberInput />` opts in. */
  useGrouping?: boolean;
  /** Clamped on blur, silently — no error UI. */
  min?: number;
  max?: number;
  onValueChange?: (value: number | null) => void;
  /** Ref to the underlying `<input>`. Used to restore caret position after reformat. */
  inputRef: React.RefObject<HTMLInputElement | null>;
};

export type NumberMaskInputProps = {
  inputMode: "decimal" | "numeric";
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onFocus: React.FocusEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  onCompositionStart: React.CompositionEventHandler<HTMLInputElement>;
  onCompositionEnd: React.CompositionEventHandler<HTMLInputElement>;
};

export type UseNumberMaskResult = {
  display: string;
  inputProps: NumberMaskInputProps;
};

/**
 * Drives live formatting and parsing for a masked numeric `<input>`.
 *
 * - **Focused** — formatted live (`Intl` grouping), preserving the user's in-progress
 *   decimal portion (e.g., typing `1234.5` shows `1,234.5`, not the padded `1,234.50`).
 * - **Blurred** — `Intl.NumberFormat` `style: "decimal"` with min/max decimals padded.
 * - **Blur reflow** — empty stays empty (never `"Rp 0"`); clamps to `min` / `max`.
 * - **Caret** — preserved across reformats by counting significant chars (digits +
 *   decimal mark + leading sign) before the caret and re-locating in the new string.
 * - **IME** — does not emit while composing; reformats on `compositionend`.
 */
export function useNumberMask(
  opts: UseNumberMaskOptions,
): UseNumberMaskResult {
  const {
    value,
    locale,
    decimals,
    allowNegative,
    useGrouping = true,
    min,
    max,
    onValueChange,
    inputRef,
  } = opts;

  const separators = React.useMemo(() => deriveSeparators(locale), [locale]);
  const decimalMark = separators.decimal;

  const [focused, setFocused] = React.useState(false);
  const [rawDraft, setRawDraft] = React.useState<string>("");
  const isComposing = React.useRef(false);
  /** When set, useLayoutEffect restores the caret after the next render. */
  const pendingSignificantCaret = React.useRef<number | null>(null);

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = () => {
    setFocused(true);
    setRawDraft(numberToRawForEdit(value ?? null, decimalMark, decimals));
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const inputEl = e.target;
    const editedDisplay = inputEl.value;
    const caretBefore = inputEl.selectionStart ?? editedDisplay.length;

    const significantBefore = countSignificantBefore(
      editedDisplay,
      caretBefore,
      decimalMark,
    );

    const cleaned = sanitizeForEditing(
      editedDisplay,
      decimalMark,
      decimals,
      allowNegative,
    );
    setRawDraft(cleaned);
    pendingSignificantCaret.current = significantBefore;

    if (isComposing.current) return;
    const parsed = parseAndTruncate(cleaned, decimalMark, decimals, allowNegative);
    onValueChange?.(parsed);
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = () => {
    setFocused(false);
    pendingSignificantCaret.current = null;
    const parsed = parseAndTruncate(rawDraft, decimalMark, decimals, allowNegative);
    const clamped = parsed === null ? null : clampNumber(parsed, min, max);
    onValueChange?.(clamped);
  };

  const handleCompositionStart: React.CompositionEventHandler<
    HTMLInputElement
  > = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd: React.CompositionEventHandler<HTMLInputElement> = (
    e,
  ) => {
    isComposing.current = false;
    const cleaned = sanitizeForEditing(
      e.currentTarget.value,
      decimalMark,
      decimals,
      allowNegative,
    );
    setRawDraft(cleaned);
    const parsed = parseAndTruncate(cleaned, decimalMark, decimals, allowNegative);
    onValueChange?.(parsed);
  };

  const display = focused
    ? formatLive(rawDraft, locale, decimalMark, decimals, useGrouping)
    : formatNumber(value ?? null, locale, decimals, useGrouping);

  // After the input value updates, restore the caret to its significant-char position.
  React.useLayoutEffect(() => {
    const significant = pendingSignificantCaret.current;
    if (significant === null) return;
    pendingSignificantCaret.current = null;

    const el = inputRef.current;
    if (!el) return;
    if (typeof document !== "undefined" && document.activeElement !== el) return;

    const pos = caretPosForSignificantCount(el.value, significant, decimalMark);
    try {
      el.setSelectionRange(pos, pos);
    } catch {
      /* some input types (e.g., type="number") throw — ignore */
    }
  });

  const inputMode: "decimal" | "numeric" =
    decimals > 0 || allowNegative ? "decimal" : "numeric";

  return {
    display,
    inputProps: {
      inputMode,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onCompositionStart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
    },
  };
}
