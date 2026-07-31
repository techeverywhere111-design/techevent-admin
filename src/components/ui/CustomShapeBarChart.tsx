import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type LabelProps,
} from "recharts";
import { type ChartData } from "@/types/chart";
import { ShieldX } from "lucide-react";

const CHART_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#EF4444",
  "#EC4899",
  "#1F2937",
];

interface CustomShapeBarChartProps {
  data: ChartData[];
  isUnauthorized?: boolean;
}

const getTrianglePath = (x: number, y: number, width: number, height: number) =>
  `M${x},${y + height}C${x + width / 3},${y + height} ${
    x + width / 2
  },${y + height / 3} ${x + width / 2},${y} C${x + width / 2},${
    y + height / 3
  } ${x + (2 * width) / 3},${y + height} ${x + width},${y + height} Z`;

const TriangleBar = ({
  x,
  y,
  width,
  height,
  index,
  isActive,
}: BarShapeProps): React.ReactElement => {
  const color = CHART_COLORS[index % CHART_COLORS.length];

  return (
    <path
      d={getTrianglePath(Number(x), Number(y), Number(width), Number(height))}
      fill={color}
      stroke={color}
      strokeWidth={isActive ? 4 : 0}
      style={{ transition: "stroke-width 0.3s ease-out" }}
    />
  );
};

const CustomColorLabel = (props: LabelProps): React.ReactElement => {
  const color = CHART_COLORS[(props.index ?? 0) % CHART_COLORS.length];
  return <Label {...props} fill={color} />;
};

const CustomShapeBarChart: React.FC<CustomShapeBarChartProps> = ({ data, isUnauthorized = false }) =>
  isUnauthorized ? (
    <div className="flex flex-col items-center justify-center h-[320px] text-center p-4">
      <ShieldX size={32} className="text-red-500 mb-2" />
      <p className="text-xs font-medium text-red-500">
        This user is not authorized to view this
      </p>
    </div>
  ) : (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 24, right: 12, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
        <Tooltip cursor={{ fillOpacity: 0.12 }} />
        <XAxis
          dataKey="name"
          interval={0}
          tick={{ fontSize: 12 }}
          angle={-20}
          textAnchor="end"
          height={70}
        />
        <YAxis allowDecimals={false} width="auto" />
        <Bar dataKey="value" shape={TriangleBar} activeBar>
          <LabelList content={CustomColorLabel} position="top" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

export default CustomShapeBarChart;
