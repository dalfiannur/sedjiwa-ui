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

/** Strip everything that isn't a digit, the locale decimal mark, or a leading minus (when allowed). */
function sanitizeForEditing(
  raw: string,
  decimal: string,
  allowNegative: boolean,
): string {
  let s = raw;
  let negative = false;
  if (s.startsWith("-")) {
    if (allowNegative) negative = true;
    s = s.slice(1);
  }
  const allowed = new RegExp(`[^0-9${escapeRegex(decimal)}]`, "g");
  s = s.replace(allowed, "");
  // Collapse multiple decimal marks to the first one.
  const firstDecimal = s.indexOf(decimal);
  if (firstDecimal !== -1) {
    const head = s.slice(0, firstDecimal + decimal.length);
    const tail = s.slice(firstDecimal + decimal.length).split(decimal).join("");
    s = head + tail;
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

function numberToRawString(n: number | null, decimal: string): string {
  if (n === null) return "";
  const s = String(n);
  return decimal === "." ? s : s.replaceAll(".", decimal);
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

/**
 * Drives the live formatting and parsing for `<CurrencyInput />`.
 *
 * - **Focused** — display the user's raw editable string (digits + locale decimal mark).
 * - **Blurred** — display `Intl.NumberFormat` `style: "decimal"` grouping.
 * - **Blur reflow** — empty stays empty (never `"Rp 0"`); clamps to `min` / `max`.
 * - **IME** — does not emit while composing; reformats on `compositionend`.
 * - **Caret** — accepted trade-off: caret jumps to end after reformatting in v1.
 */
export function useCurrencyMask(
  opts: UseCurrencyMaskOptions,
): UseCurrencyMaskResult {
  const { value, config, allowNegative, min, max, onValueChange } = opts;
  const { locale, decimals } = config;

  const separators = React.useMemo(() => deriveSeparators(locale), [locale]);
  const decimalMark = separators.decimal;

  const [focused, setFocused] = React.useState(false);
  const [rawDraft, setRawDraft] = React.useState<string>("");
  const isComposing = React.useRef(false);

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = () => {
    setFocused(true);
    setRawDraft(numberToRawString(value ?? null, decimalMark));
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const cleaned = sanitizeForEditing(e.target.value, decimalMark, allowNegative);
    setRawDraft(cleaned);
    if (isComposing.current) return;
    const parsed = parseAndTruncate(cleaned, decimalMark, decimals, allowNegative);
    onValueChange?.(parsed);
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = () => {
    setFocused(false);
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
      allowNegative,
    );
    setRawDraft(cleaned);
    const parsed = parseAndTruncate(cleaned, decimalMark, decimals, allowNegative);
    onValueChange?.(parsed);
  };

  const display = focused
    ? rawDraft
    : formatNumber(value ?? null, locale, decimals);

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
