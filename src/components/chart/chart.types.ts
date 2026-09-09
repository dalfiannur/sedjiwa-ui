/** One plotted series. `key` is the property to read from each datum. */
export type ChartSeries = {
  key: string;
  label: string;
  /** Any CSS colour. Omit and the series takes `--chart-1` … `--chart-5` by
   *  position, cycling past five. Those tokens are contrast-checked in both
   *  themes; a literal hex is not. */
  color?: string;
};

export type ChartDatum = Record<string, string | number | null | undefined>;

/** `--chart-1` … `--chart-5`, cycled. Five is the whole ramp: past that,
 *  series stop being tellable apart by colour and want a different encoding. */
export function seriesColor(series: { color?: string }, index: number): string {
  return series.color ?? `var(--chart-${(index % 5) + 1})`;
}
