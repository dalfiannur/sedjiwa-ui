import type * as React from "react";
import { useNumberMask } from "../../lib/use-number-mask";
import type { CurrencyConfig } from "./currency-presets";

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

/**
 * `<CurrencyInput />`'s view of the shared mask engine — it supplies the locale
 * and decimal count from the resolved `CurrencyConfig` and always groups, since
 * money is never written without thousands separators.
 *
 * The behaviour lives in `lib/use-number-mask.ts`; see that file for what the
 * mask does on focus, blur and composition.
 */
export function useCurrencyMask(opts: UseCurrencyMaskOptions) {
  const { config, ...rest } = opts;
  return useNumberMask({
    ...rest,
    locale: config.locale,
    decimals: config.decimals,
    useGrouping: true,
  });
}
