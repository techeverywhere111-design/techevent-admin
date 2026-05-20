import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import SkeletonLoader from "./SkeletonLoader";

// ---- Types ---- //
export interface LineChartData {
  month: string;
  currentYear: number;
  lastYear: number;
}

interface LineChartCardProps {
  title: string;
  data?: LineChartData[];
  loading: boolean;
  onYearChange?: (year: string) => void;
  selectedYear?: string;
  comparisonYears?: string[];
}

const currentYearValue = new Date().getFullYear();
const defaultComparisonYears = Array.from({ length: 5 }, (_, i) => (currentYearValue - 1 - i).toString());

const LineChartCard: React.FC<LineChartCardProps> = ({
  title,
  data = [],
  loading,
  onYearChange,
  selectedYear = defaultComparisonYears[0],
  comparisonYears = defaultComparisonYears,
}) => {
  return (
    <div className="bg-white dark:bg-[#0B1120] shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">
            Year Comparison:
          </label>
          <select
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-[#1E293B] text-gray-700 dark:text-gray-200 transition-colors duration-300"
            value={selectedYear}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onYearChange?.(e.target.value)
            }
          >
            {comparisonYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader height="h-64" />
      ) : (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 40, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#6b7280"
                strokeOpacity={0.2}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#9ca3af" }}
                stroke="#6b7280"
              />
              <YAxis tick={{ fill: "#9ca3af" }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  color: "#f3f4f6",
                }}
                itemStyle={{ color: "#f3f4f6" }}
                cursor={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <Legend
                verticalAlign="top"
                align="center"
                height={36}
                wrapperStyle={{ color: "#d1d5db" }}
              />
              <Line
                type="monotone"
                dataKey="currentYear"
                name="Current Year"
                stroke="#22c55e"
                strokeWidth={2}
                dot
              />
              <Line
                type="monotone"
                dataKey="lastYear"
                name="Year Comparison"
                stroke="#ef4444"
                strokeWidth={2}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default LineChartCard;
