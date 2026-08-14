import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import SkeletonLoader from "./SkeletonLoader";
import { ShieldX } from "lucide-react";
import { type ChartData } from "@/types/chart";

interface PieChartCardProps {
  title: string;
  data?: ChartData[];
  colors?: string[];
  loading: boolean;
  isUnauthorized?: boolean;
  height?: number;
}

const renderPercentageLabel = (
  props: PieLabelRenderProps
): React.ReactElement | null => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

  const cxNum = Number(cx ?? 0);
  const cyNum = Number(cy ?? 0);
  const midAngleNum = Number(midAngle ?? 0);
  const innerNum = Number(innerRadius ?? 0);
  const outerNum = Number(outerRadius ?? 0);
  const percentNum = Number(percent ?? 0);

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
  isUnauthorized = false,
  height = 200,
}) => {
  const isEmpty = data.length === 0 || data.every((d) => d.value === 0);

  // When all values are 0, render a single full-circle grey segment so the ring is always visible
  const renderData: ChartData[] = isEmpty
    ? [{ name: "__empty__", value: 1 }]
    : data;

  return (
    <div className="bg-white dark:bg-[#0B1120] shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-300">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {title}
      </h3>

      {loading ? (
        <SkeletonLoader height="h-48" />
      ) : isUnauthorized ? (
        <div className="flex flex-col items-center justify-center h-48 text-center p-4">
          <ShieldX size={32} className="text-red-500 mb-2" />
          <p className="text-xs font-medium text-red-500">
            This user is not authorized to view this
          </p>
        </div>
      ) : (
        <>
          <div style={{ width: "100%", height }} className="relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  cursor={{ fillOpacity: 0.12 }}
                  formatter={isEmpty ? () => null : undefined}
                />
                <Pie
                  data={renderData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={isEmpty ? 0 : 2}
                  labelLine={false}
                  label={isEmpty ? undefined : renderPercentageLabel}
                >
                  {renderData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={isEmpty ? "#e5e7eb" : colors[index % colors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs text-gray-400 dark:text-gray-500">No data</span>
              </div>
            )}
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
