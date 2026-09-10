/**
 * The masking engine behind the numeric fields — `<CurrencyInput />` and
 * `<NumberInput />` both drive their display through these functions.
 *
 * Everything here is pure and React-free on purpose: the caret arithmetic is
 * the fiddly part, and it is far easier to pin down in a unit test than through
 * a rendered input. `use-number-mask.ts` holds the React half.
 */

export type NumberSeparators = { group: string; decimal: string };

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function deriveSeparators(locale: string): NumberSeparators {
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
export function sanitizeForEditing(
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

export function parseAndTruncate(
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

/** Numeric → editable raw string, padded to `decimals`. Used to seed the draft on focus. */
export function numberToRawForEdit(
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
export function formatLive(
  raw: string,
  locale: string,
  decimal: string,
  decimals: number,
  useGrouping: boolean,
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
          useGrouping,
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

export function formatNumber(
  n: number | null,
  locale: string,
  decimals: number,
  useGrouping: boolean,
): string {
  if (n === null) return "";
  try {
    return new Intl.NumberFormat(locale, {
      style: "decimal",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping,
    }).format(n);
  } catch {
    return n.toFixed(decimals);
  }
}

export function clampNumber(n: number, min?: number, max?: number): number {
  let v = n;
  if (min !== undefined && v < min) v = min;
  if (max !== undefined && v > max) v = max;
  return v;
}

function isSignificantChar(ch: string, decimal: string): boolean {
  return (ch >= "0" && ch <= "9") || ch === decimal || ch === "-";
}

/** Find the caret position in `formatted` that corresponds to having passed `n` significant chars. */
export function caretPosForSignificantCount(
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

export function countSignificantBefore(
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
