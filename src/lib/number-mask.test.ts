import { describe, expect, it } from "vitest";
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

describe("deriveSeparators", () => {
  it("reads the Indonesian pair off Intl", () => {
    expect(deriveSeparators("id-ID")).toEqual({ group: ".", decimal: "," });
  });

  it("reads the US pair off Intl", () => {
    expect(deriveSeparators("en-US")).toEqual({ group: ",", decimal: "." });
  });

  it("falls back to the US pair when the tag is not a locale", () => {
    expect(deriveSeparators("not a locale")).toEqual({
      group: ",",
      decimal: ".",
    });
  });
});

describe("sanitizeForEditing", () => {
  it("drops group marks and keeps digits", () => {
    expect(sanitizeForEditing("1.234.567", ",", 2, false)).toBe("1234567");
  });

  it("keeps the decimal mark when decimals are allowed", () => {
    expect(sanitizeForEditing("1234,5", ",", 2, false)).toBe("1234,5");
  });

  it("strips the decimal mark entirely when decimals is 0", () => {
    expect(sanitizeForEditing("1234,5", ",", 0, false)).toBe("12345");
  });

  it("collapses a second decimal mark into the first", () => {
    expect(sanitizeForEditing("1,2,3", ",", 2, false)).toBe("1,23");
  });

  it("drops a leading minus when negatives are not allowed", () => {
    expect(sanitizeForEditing("-42", ",", 0, false)).toBe("42");
  });

  it("keeps a leading minus when negatives are allowed", () => {
    expect(sanitizeForEditing("-42", ",", 0, true)).toBe("-42");
  });
});

describe("parseAndTruncate", () => {
  it("returns null for an empty string", () => {
    expect(parseAndTruncate("", ",", 2, false)).toBeNull();
  });

  it("returns null for a bare decimal mark", () => {
    expect(parseAndTruncate(",", ",", 2, false)).toBeNull();
  });

  it("parses a locale decimal mark as the fraction", () => {
    expect(parseAndTruncate("1234,56", ",", 2, false)).toBe(1234.56);
  });

  it("truncates rather than rounds the excess fraction", () => {
    expect(parseAndTruncate("1,999", ",", 2, false)).toBe(1.99);
  });

  it("truncates to an integer when decimals is 0", () => {
    expect(parseAndTruncate("1,99", ",", 0, false)).toBe(1);
  });

  it("negates when negatives are allowed", () => {
    expect(parseAndTruncate("-5", ",", 0, true)).toBe(-5);
  });

  it("ignores the sign when negatives are not allowed", () => {
    expect(parseAndTruncate("-5", ",", 0, false)).toBe(5);
  });
});

describe("numberToRawForEdit", () => {
  it("returns an empty string for null", () => {
    expect(numberToRawForEdit(null, ",", 2)).toBe("");
  });

  it("pads to the decimal count using the locale mark", () => {
    expect(numberToRawForEdit(1234.5, ",", 2)).toBe("1234,50");
  });

  it("truncates toward zero when decimals is 0", () => {
    expect(numberToRawForEdit(1234.9, ",", 0)).toBe("1234");
  });
});

describe("formatLive", () => {
  it("groups the integer part while typing", () => {
    expect(formatLive("1234567", "id-ID", ",", 2, true)).toBe("1.234.567");
  });

  it("preserves a half-typed fraction instead of padding it", () => {
    expect(formatLive("1234,5", "id-ID", ",", 2, true)).toBe("1.234,5");
  });

  it("preserves a trailing decimal mark with no fraction yet", () => {
    expect(formatLive("1234,", "id-ID", ",", 2, true)).toBe("1.234,");
  });

  it("leaves the integer ungrouped when grouping is off", () => {
    expect(formatLive("1234567", "id-ID", ",", 2, false)).toBe("1234567");
  });

  it("returns an empty string for empty input", () => {
    expect(formatLive("", "id-ID", ",", 2, true)).toBe("");
  });

  it("keeps the leading minus", () => {
    expect(formatLive("-1234", "id-ID", ",", 0, true)).toBe("-1.234");
  });
});

describe("formatNumber", () => {
  it("returns an empty string for null", () => {
    expect(formatNumber(null, "id-ID", 2, true)).toBe("");
  });

  it("pads the fraction to the decimal count", () => {
    expect(formatNumber(1234.5, "id-ID", 2, true)).toBe("1.234,50");
  });

  it("omits group marks when grouping is off", () => {
    expect(formatNumber(1234.5, "id-ID", 2, false)).toBe("1234,50");
  });

  it("renders zero rather than an empty string", () => {
    expect(formatNumber(0, "id-ID", 0, true)).toBe("0");
  });
});

describe("clampNumber", () => {
  it("raises a value below min", () => {
    expect(clampNumber(1, 5, 10)).toBe(5);
  });

  it("lowers a value above max", () => {
    expect(clampNumber(99, 5, 10)).toBe(10);
  });

  it("leaves a value inside the range alone", () => {
    expect(clampNumber(7, 5, 10)).toBe(7);
  });

  it("ignores bounds that are undefined", () => {
    expect(clampNumber(-99)).toBe(-99);
  });
});

describe("caret mapping", () => {
  it("counts digits before the caret and ignores group marks", () => {
    // "1.234.567", caret after the second group mark -> 4 significant chars.
    expect(countSignificantBefore("1.234.567", 6, ",")).toBe(4);
  });

  it("counts the decimal mark as significant", () => {
    expect(countSignificantBefore("1.234,5", 6, ",")).toBe(5);
  });

  it("stops at the end of the string when the caret runs past it", () => {
    expect(countSignificantBefore("12", 99, ",")).toBe(2);
  });

  it("re-locates a significant count in the reformatted string", () => {
    // 4 significant chars into "1.234.567" is just after the "4".
    expect(caretPosForSignificantCount("1.234.567", 4, ",")).toBe(5);
  });

  it("returns 0 for a count of 0", () => {
    expect(caretPosForSignificantCount("1.234", 0, ",")).toBe(0);
  });

  it("clamps to the end when the count exceeds what the string holds", () => {
    expect(caretPosForSignificantCount("1.234", 99, ",")).toBe(5);
  });

  it("round-trips a caret across a regrouping edit", () => {
    // User had "1.234" with the caret after "2" (2 significant chars), then
    // typed a digit making the raw "12345" -> "12.345". The caret should land
    // after the same two significant chars.
    const significant = countSignificantBefore("1.234", 3, ",");
    expect(caretPosForSignificantCount("12.345", significant, ",")).toBe(2);
  });
});
