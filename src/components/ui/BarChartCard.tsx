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
import SkeletonLoader from "@/components/ui/SkeletonLoader";

// ---- Type Definitions ---- //
interface BarChartCardProps {
  title: string;
  data: Array<Record<string, number | string>>;
  xKey: string;
  barKey: string;
  loading: boolean;
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
  barSize = 50,
  colors = [],
  xAxisLabel = "",
  yAxisLabel = "",
  chartType = "",
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-bold text-gray-700 mb-3">{title}</h3>

      {loading ? (
        <SkeletonLoader height="h-[200px] sm:h-[250px] lg:h-[300px]" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={data}
              barSize={barSize}
              margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey}>
                {xAxisLabel && (
                  <Label
                    value={xAxisLabel}
                    offset={-5}
                    position="insideBottom"
                    style={{
                      textAnchor: "middle",
                      fill: "#6b7280",
                      fontSize: 12,
                    }}
                  />
                )}
              </XAxis>
              <YAxis>
                {yAxisLabel && (
                  <Label
                    value={yAxisLabel}
                    angle={-90}
                    position="insideLeft"
                    style={{
                      textAnchor: "middle",
                      fill: "#000000",
                      fontSize: 12,
                      fontWeight: 1000,
                    }}
                  />
                )}
              </YAxis>

              <Tooltip />

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
              <span className="text-xs sm:text-sm font-bold text-gray-950">
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
