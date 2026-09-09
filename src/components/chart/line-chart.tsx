import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
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

export type LineChartProps = Omit<ChartContainerProps, "children"> & {
  data: ChartDatum[];
  xKey: string;
  series: ChartSeries[];
  /** Play recharts' mount animation. Off by default: a dashboard chart is read,
   *  not watched, and the animation delays the first frame that can actually
   *  be read. It is also the fragile path — the donut's animation can stick at
   *  its opening frame under a re-measure, leaving slices drawn at ~1°. Turn it
   *  on deliberately, and consider prefers-reduced-motion when you do. */
  animated?: boolean;
  showGrid?: boolean;
  /** Draw a dot at every point. Worth it on a sparse series where the readings
   *  themselves matter; noise on a dense one. */
  showDots?: boolean;
  formatValue?: (value: string | number) => string;
};

export function LineChart({
  data,
  xKey,
  series,
  animated = false,
  showGrid = true,
  showDots = true,
  formatValue,
  ...containerProps
}: LineChartProps) {
  return (
    <ChartContainer data-chart="line" {...containerProps}>
      <RechartsLineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={color}
              strokeWidth={2.5}
              isAnimationActive={animated}
              dot={showDots ? { r: 3, strokeWidth: 0, fill: color } : false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          );
        })}
      </RechartsLineChart>
    </ChartContainer>
  );
}
