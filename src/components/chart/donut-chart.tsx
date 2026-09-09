import { Cell, Pie, PieChart, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartContainerProps,
} from "./chart";
import { seriesColor } from "./chart.types";

export type DonutSlice = {
  label: string;
  value: number;
  /** Falls back to `--chart-1` … `--chart-5` by position. */
  color?: string;
};

export type DonutChartProps = Omit<ChartContainerProps, "children"> & {
  data: DonutSlice[];
  /** Fraction of the outer radius left hollow. 0 draws a full pie. */
  innerRatio?: number;
  /** Play recharts' mount animation. Off by default: a dashboard chart is read,
   *  not watched, and the animation delays the first frame that can actually
   *  be read. It is also the fragile path — the donut's animation can stick at
   *  its opening frame under a re-measure, leaving slices drawn at ~1°. Turn it
   *  on deliberately, and consider prefers-reduced-motion when you do. */
  animated?: boolean;
  formatValue?: (value: string | number) => string;
};

export function DonutChart({
  data,
  innerRatio = 0.68,
  animated = false,
  formatValue,
  height = 260,
  ...containerProps
}: DonutChartProps) {
  // Radii are derived from the stated height rather than passed as percent
  // strings, so the ring keeps its thickness instead of thinning out as the
  // container grows wider than it is tall.
  const outerRadius = Math.max(0, height / 2 - 8);
  const innerRadius = outerRadius * innerRatio;

  return (
    <ChartContainer data-chart="donut" height={height} {...containerProps}>
      <PieChart>
        <Tooltip content={<ChartTooltipContent formatValue={formatValue} />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          isAnimationActive={animated}
          // No slice labels: at this size they collide, and the legend beside
          // the chart already names every slice.
          label={false}
          labelLine={false}
          stroke="var(--card)"
          strokeWidth={2}
        >
          {data.map((slice, i) => (
            <Cell key={slice.label} fill={seriesColor(slice, i)} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
