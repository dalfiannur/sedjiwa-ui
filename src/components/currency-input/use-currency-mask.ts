import * as React from "react";
import type { CurrencyConfig } from "./currency-presets";

type Separators = { group: string; decimal: string };

type UseCurrencyMaskOptions = {
  value: number | null | undefined;
  config: Required<CurrencyConfig>;
  allowNegative: boolean;
  min?: number;
  max?: number;
  onValueChange?: (value: number | null) => void;
  /** Ref to the underlying `<input>`. Used to restore caret position after reformat. */
  inputRef: React.RefObject<HTMLInputElement | null>;
};

type CurrencyMaskInputProps = {
  inputMode: "decimal" | "numeric";
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onFocus: React.FocusEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  onCompositionStart: React.CompositionEventHandler<HTMLInputElement>;
  onCompositionEnd: React.CompositionEventHandler<HTMLInputElement>;
};

type UseCurrencyMaskResult = {
  display: string;
  inputProps: CurrencyMaskInputProps;
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function deriveSeparators(locale: string): Separators {
  try {
    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    const group = parts.find((p) => p.type === "group")?.value ?? ",";
    const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
    return { group, decimal };
  } catch {
    return { group: ",", decimal: "." };
  }
}

/** Strip everything that isn't a digit, the locale decimal mark (when `decimals > 0`), or a leading minus (when allowed). */
function sanitizeForEditing(
  raw: string,
  decimal: string,
  decimals: number,
  allowNegative: boolean,
): string {
  let s = raw;
  let negative = false;
  if (s.startsWith("-")) {
    if (allowNegative) negative = true;
    s = s.slice(1);
  }
  if (decimals === 0) {
    s = s.replace(/[^0-9]/g, "");
  } else {
    const allowed = new RegExp(`[^0-9${escapeRegex(decimal)}]`, "g");
    s = s.replace(allowed, "");
    // Collapse multiple decimal marks to the first one.
    const firstDecimal = s.indexOf(decimal);
    if (firstDecimal !== -1) {
      const head = s.slice(0, firstDecimal + decimal.length);
      const tail = s.slice(firstDecimal + decimal.length).split(decimal).join("");
      s = head + tail;
    }
  }
  return negative ? "-" + s : s;
}

function parseAndTruncate(
  raw: string,
  decimal: string,
  decimals: number,
  allowNegative: boolean,
): number | null {
  let s = raw.trim();
  if (!s) return null;

  let negative = false;
  if (s.startsWith("-")) {
    if (allowNegative) negative = true;
    s = s.slice(1);
  }

  s = s.replace(new RegExp(`[^0-9${escapeRegex(decimal)}]`, "g"), "");
  if (decimal !== ".") {
    s = s.split(decimal).join(".");
  }
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replaceAll(".", "");
  }

  if (!s || s === ".") return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;

  // Truncate (don't round) to `decimals`.
  const factor = Math.pow(10, decimals);
  const truncated = Math.trunc(n * factor) / factor;
  return negative ? -truncated : truncated;
}

/** Numeric → editable raw string, padded to `decimals`. Used to seed `rawDraft` on focus. */
function numberToRawForEdit(
  n: number | null,
  decimal: string,
  decimals: number,
): string {
  if (n === null) return "";
  const s = decimals > 0 ? n.toFixed(decimals) : String(Math.trunc(n));
  return decimal === "." ? s : s.replaceAll(".", decimal);
}

/**
 * Format the user's in-progress raw string with locale grouping while preserving
 * their typing state (e.g., trailing decimal mark with no fraction, partial fraction).
 */
function formatLive(
  raw: string,
  locale: string,
  decimal: string,
  decimals: number,
): string {
  if (!raw) return "";

  let s = raw;
  let negative = false;
  if (s.startsWith("-")) {
    negative = true;
    s = s.slice(1);
  }

  const decIdx = decimals > 0 ? s.indexOf(decimal) : -1;
  const intPart = decIdx >= 0 ? s.slice(0, decIdx) : s;
  const fracPart = decIdx >= 0 ? s.slice(decIdx + decimal.length) : null;

  let formattedInt = "";
  if (intPart) {
    const n = Number(intPart);
    if (Number.isFinite(n)) {
      try {
        formattedInt = new Intl.NumberFormat(locale, {
          useGrouping: true,
          maximumFractionDigits: 0,
        }).format(n);
      } catch {
        formattedInt = intPart;
      }
    } else {
      formattedInt = intPart;
    }
  }

  let result = formattedInt;
  if (fracPart !== null && decimals > 0) {
    result += decimal + fracPart.slice(0, decimals);
  }
  return negative ? "-" + result : result;
}

function formatNumber(
  n: number | null,
  locale: string,
  decimals: number,
): string {
  if (n === null) return "";
  try {
    return new Intl.NumberFormat(locale, {
      style: "decimal",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(n);
  } catch {
    return n.toFixed(decimals);
  }
}

function clamp(n: number, min?: number, max?: number): number {
  let v = n;
  if (min !== undefined && v < min) v = min;
  if (max !== undefined && v > max) v = max;
  return v;
}

function isSignificantChar(ch: string, decimal: string): boolean {
  return (ch >= "0" && ch <= "9") || ch === decimal || ch === "-";
}

/** Find the caret position in `formatted` that corresponds to having passed `n` significant chars. */
function caretPosForSignificantCount(
  formatted: string,
  n: number,
  decimal: string,
): number {
  if (n <= 0) return 0;
  let count = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (isSignificantChar(formatted[i]!, decimal)) {
      count++;
      if (count === n) return i + 1;
    }
  }
  return formatted.length;
}

function countSignificantBefore(
  s: string,
  caret: number,
  decimal: string,
): number {
  let count = 0;
  const stop = Math.min(caret, s.length);
  for (let i = 0; i < stop; i++) {
    if (isSignificantChar(s[i]!, decimal)) count++;
  }
  return count;
}

/**
 * Drives the live formatting and parsing for `<CurrencyInput />`.
 *
 * - **Focused** — formatted live (`Intl` grouping), preserving the user's in-progress
 *   decimal portion (e.g., typing `1234.5` shows `1,234.5`, not the padded `1,234.50`).
 * - **Blurred** — `Intl.NumberFormat` `style: "decimal"` with min/max decimals padded.
 * - **Blur reflow** — empty stays empty (never `"Rp 0"`); clamps to `min` / `max`.
 * - **Caret** — preserved across reformats by counting significant chars (digits +
 *   decimal mark + leading sign) before the caret and re-locating in the new string.
 * - **IME** — does not emit while composing; reformats on `compositionend`.
 */
export function useCurrencyMask(
  opts: UseCurrencyMaskOptions,
): UseCurrencyMaskResult {
  const { value, config, allowNegative, min, max, onValueChange, inputRef } = opts;
  const { locale, decimals } = config;

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
    const clamped = parsed === null ? null : clamp(parsed, min, max);
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
    ? formatLive(rawDraft, locale, decimalMark, decimals)
    : formatNumber(value ?? null, locale, decimals);

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
