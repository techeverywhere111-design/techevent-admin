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
}

// ---- Component ---- //
const LineChartCard: React.FC<LineChartCardProps> = ({
  title,
  data = [],
  loading,
  onYearChange,
  selectedYear = "2025",
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
      {/* Header: Title + Year Selector */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <div className="flex items-center space-x-2">
          <label className="text-xs text-gray-500">Current Year:</label>
          <select
            className="text-sm border rounded px-2 py-1"
            value={selectedYear}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onYearChange?.(e.target.value)
            }
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {/* Chart or Loader */}
      {loading ? (
        <SkeletonLoader height="h-64" />
      ) : (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 40, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" align="center" height={36} />
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
                name="Last Year"
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
