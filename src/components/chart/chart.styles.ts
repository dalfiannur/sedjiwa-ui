/** Shared axis and grid styling, kept out of the component file so the chart
 *  wrappers cannot drift apart on what an axis looks like — and so chart.tsx
 *  exports components only. */
export const chartAxisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: "var(--muted-foreground)", fontSize: 11 },
} as const;

export const chartGridProps = {
  stroke: "var(--border)",
  strokeDasharray: "0",
  vertical: false,
} as const;
