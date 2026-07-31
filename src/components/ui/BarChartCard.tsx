import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  Cell,
} from "recharts";
import { type ChartData } from "@/types/chart";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import { ShieldX } from "lucide-react";

interface BarChartCardProps {
  title: string;
  data: ChartData[];
  xKey: string;
  barKey: string;
  loading: boolean;
  isUnauthorized?: boolean;
  barSize?: number;
  colors?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  chartType?: string;
}

const BarChartCard: React.FC<BarChartCardProps> = ({
  title,
  data = [],
  xKey,
  barKey,
  loading,
  isUnauthorized = false,
  barSize = 50,
  colors = [],
  xAxisLabel = "",
  yAxisLabel = "",
  chartType = "",
}) => {
  return (
    <div className="bg-white dark:bg-[#0B1120] shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
        {title}
      </h3>

      {loading ? (
        <SkeletonLoader height="h-[200px] sm:h-[250px] lg:h-[300px]" />
      ) : isUnauthorized ? (
        <div className="flex flex-col items-center justify-center h-[250px] text-center p-4">
          <ShieldX size={32} className="text-red-500 mb-2" />
          <p className="text-xs font-medium text-red-500">
            This user is not authorized to view this
          </p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={data}
              barSize={barSize}
              margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                strokeOpacity={0.2}
                stroke="#6b7280"
              />
              <XAxis dataKey={xKey} tick={{ fill: "#6b7280" }} stroke="#6b7280">
                {xAxisLabel && (
                  <Label
                    value={xAxisLabel}
                    offset={-5}
                    position="insideBottom"
                    style={{
                      textAnchor: "middle",
                      fill: "#9ca3af",
                      fontSize: 12,
                    }}
                  />
                )}
              </XAxis>

              <YAxis tick={{ fill: "#6b7280" }} stroke="#6b7280">
                {yAxisLabel && (
                  <Label
                    value={yAxisLabel}
                    angle={-90}
                    position="insideLeft"
                    style={{
                      textAnchor: "middle",
                      fill: "#9ca3af",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                )}
              </YAxis>

              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  color: "#f3f4f6",
                }}
                itemStyle={{ color: "#f3f4f6" }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />

              <Bar dataKey={barKey} radius={[6, 6, 0, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {chartType && (
            <div className="flex justify-center mt-2">
              <span className="text-xs sm:text-sm font-bold text-gray-950 dark:text-gray-200">
                {chartType}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BarChartCard;
