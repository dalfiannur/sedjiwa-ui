import * as React from "react";
import {
  Area,
  CartesianGrid,
  AreaChart as RechartsAreaChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartContainerProps,
} from "./chart";
import { chartAxisProps, chartGridProps } from "./chart.styles";
import { seriesColor, type ChartDatum, type ChartSeries } from "./chart.types";

export type AreaChartProps = Omit<ChartContainerProps, "children"> & {
  data: ChartDatum[];
  /** Property holding each datum's category — the x axis. */
  xKey: string;
  series: ChartSeries[];
  /** Sum the series into bands instead of overlaying them. */
  stacked?: boolean;
  /** Play recharts' mount animation. Off by default: a dashboard chart is read,
   *  not watched, and the animation delays the first frame that can actually
   *  be read. It is also the fragile path — the donut's animation can stick at
   *  its opening frame under a re-measure, leaving slices drawn at ~1°. Turn it
   *  on deliberately, and consider prefers-reduced-motion when you do. */
  animated?: boolean;
  showGrid?: boolean;
  formatValue?: (value: string | number) => string;
};

export function AreaChart({
  data,
  xKey,
  series,
  stacked = false,
  animated = false,
  showGrid = true,
  formatValue,
  ...containerProps
}: AreaChartProps) {
  // One gradient per series, and the id has to be unique per mounted chart:
  // SVG ids are document-global, so two charts on a page would otherwise both
  // resolve to whichever <defs> rendered last and share a fill.
  const gradientId = React.useId();

  return (
    <ChartContainer data-chart="area" {...containerProps}>
      <RechartsAreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          {series.map((s, i) => {
            const color = seriesColor(s, i);
            return (
              <linearGradient
                key={s.key}
                id={`${gradientId}-${s.key}`}
                x1="0" y1="0" x2="0" y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={color} stopOpacity={0.04} />
              </linearGradient>
            );
          })}
        </defs>

        {showGrid && <CartesianGrid {...chartGridProps} />}
        <XAxis dataKey={xKey} {...chartAxisProps} />
        <YAxis {...chartAxisProps} width={40} />
        <Tooltip
          cursor={{ stroke: "var(--border)" }}
          content={<ChartTooltipContent formatValue={formatValue} />}
        />

        {series.map((s, i) => {
          const color = seriesColor(s, i);
          return (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stackId={stacked ? "stack" : undefined}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId}-${s.key})`}
              // The dot at every point is noise on a dense series; the hover
              // dot still appears, which is the one that carries information.
              isAnimationActive={animated}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          );
        })}
      </RechartsAreaChart>
    </ChartContainer>
  );
}
