// src/components/ChartCard.tsx
import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";

interface ChartProps {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  dataKey: string;
  type: "line" | "bar";
  color?: string;
  loading?: boolean;
  showMonthYear?: boolean;
  selectedMonth?: string;
  selectedYear?: string;
  onMonthChange?: (month: string) => void;
  onYearChange?: (year: string) => void;
}

const ChartSkeleton: React.FC = () => (
  <div className="h-64 sm:h-72 md:h-80 animate-pulse flex flex-col justify-end gap-2 px-4">
    <div className="flex items-end gap-[6px] h-full pt-8">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t"
          style={{ height: `${Math.random() * 60 + 20}%` }}
        />
      ))}
    </div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
  </div>
);

const ClientChartCard: React.FC<ChartProps> = ({
  title,
  data,
  dataKey,
  type,
  color = "#3b82f6",
  loading = false,
  showMonthYear = false,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2010 + 1 }, (_, i) =>
    (2010 + i).toString()
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h2>

        {showMonthYear && (
          <div className="flex flex-wrap gap-2">
            {[
              { value: selectedMonth, onChange: onMonthChange, list: months },
              { value: selectedYear, onChange: onYearChange, list: years },
            ].map(({ value, onChange, list }, idx) => (
              <div className="relative" key={idx}>
                <select
                  value={value}
                  onChange={(e) => onChange?.(e.target.value)}
                  className="appearance-none px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-xs sm:text-sm text-gray-900 dark:text-gray-100"
                >
                  {list.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
                  size={14}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chart or Skeleton */}
      {loading ? (
        <ChartSkeleton />
      ) : (
        <div className="h-64 sm:h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            {type === "line" ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    color: "#f9fafb",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    color: "#f9fafb",
                  }}
                />
                <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ClientChartCard;
