import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import SkeletonLoader from "./SkeletonLoader";
import { type ChartData } from "@/types/chart";

interface PieChartCardProps {
  title: string;
  data?: ChartData[];
  colors?: string[];
  loading: boolean;
  height?: number;
}

const renderPercentageLabel = (
  props: PieLabelRenderProps
): React.ReactElement | null => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

  // Coerce to numbers with safe defaults
  const cxNum = Number(cx ?? 0);
  const cyNum = Number(cy ?? 0);
  const midAngleNum = Number(midAngle ?? 0);
  const innerNum = Number(innerRadius ?? 0);
  const outerNum = Number(outerRadius ?? 0);
  const percentNum = Number(percent ?? 0);

  // Ensure all are valid numbers
  if (
    isNaN(cxNum) ||
    isNaN(cyNum) ||
    isNaN(midAngleNum) ||
    isNaN(innerNum) ||
    isNaN(outerNum)
  ) {
    return null;
  }

  if (percentNum < 0.04) {
    return null;
  }

  const RADIAN = Math.PI / 180;
  const radius = innerNum + (outerNum - innerNum) * 0.6;
  const x = cxNum + radius * Math.cos(-midAngleNum * RADIAN);
  const y = cyNum + radius * Math.sin(-midAngleNum * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {(percentNum * 100).toFixed(0)}%
    </text>
  );
};

const PieChartCard: React.FC<PieChartCardProps> = ({
  title,
  data = [],
  colors = [],
  loading,
  height = 200,
}) => {
  return (
    <div className="bg-white dark:bg-[#0B1120] shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-300">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {title}
      </h3>

      {loading ? (
        <SkeletonLoader height="h-48" />
      ) : (
        <>
          <div style={{ width: "100%", height }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip cursor={{ fillOpacity: 0.12 }} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={2}
                  labelLine={false}
                  label={renderPercentageLabel}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-xs sm:grid-cols-2 sm:text-sm">
            {data.map((entry, index) => (
              <div
                key={entry.name}
                className="flex min-w-0 items-start gap-2"
              >
                <span
                  className="mt-1.5 inline-block h-2 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="min-w-0 break-words leading-5 text-gray-600 dark:text-gray-400">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PieChartCard;
