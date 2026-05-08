/**
 * Currency configuration for the `<CurrencyInput />` component.
 *
 * v1 always renders the symbol as a leading addon. Trailing-symbol locales
 * (e.g. `1.234,56 €` in `de-DE`) are out of scope; consumers using a
 * `CurrencyConfig` control the symbol *string* but not its position.
 */
export type CurrencyConfig = {
  /** ISO 4217 code passed to `Intl.NumberFormat` (e.g. `"IDR"`, `"USD"`, `"EUR"`). */
  currency: string;
  /** BCP-47 locale (e.g. `"id-ID"`, `"en-US"`, `"de-DE"`). */
  locale: string;
  /**
   * Symbol rendered in the leading addon. Falls back to `Intl`'s
   * `currencyDisplay: "narrowSymbol"` rendering when omitted.
   */
  symbol?: string;
  /** Decimal places. Falls back to the `Intl` default for the currency (USD=2, IDR=0). */
  decimals?: number;
};

export type CurrencyPresetKey = "IDR" | "USD";

export const CURRENCY_PRESETS: Record<CurrencyPresetKey, Required<CurrencyConfig>> = {
  IDR: { currency: "IDR", locale: "id-ID", symbol: "Rp", decimals: 0 },
  USD: { currency: "USD", locale: "en-US", symbol: "$", decimals: 2 },
};

function deriveSymbol(currency: string, locale: string): string {
  try {
    const fmt = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    });
    const part = fmt.formatToParts(0).find((p) => p.type === "currency");
    return part?.value ?? currency;
  } catch {
    return currency;
  }
}

function deriveDecimals(currency: string, locale: string): number {
  try {
    const fmt = new Intl.NumberFormat(locale, { style: "currency", currency });
    const opts = fmt.resolvedOptions();
    return opts.maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

export function resolveCurrencyConfig(
  input: CurrencyPresetKey | CurrencyConfig,
  decimalsOverride?: number,
): Required<CurrencyConfig> {
  const base: Required<CurrencyConfig> =
    typeof input === "string"
      ? CURRENCY_PRESETS[input]
      : {
          currency: input.currency,
          locale: input.locale,
          symbol: input.symbol ?? deriveSymbol(input.currency, input.locale),
          decimals: input.decimals ?? deriveDecimals(input.currency, input.locale),
        };

  return decimalsOverride !== undefined
    ? { ...base, decimals: decimalsOverride }
    : base;
}
