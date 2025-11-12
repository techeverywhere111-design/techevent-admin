import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PieChartCard from "@/components/ui/PieChartCard";

const pieData = [
  { name: "Personal", value: 40 },
  { name: "Business", value: 60 },
];

const barData = [
  { name: "Events", value: 43 },
  { name: "Meetings", value: 33 },
  { name: "Q&A", value: 14 },
  { name: "Polls", value: 7 },
  { name: "Others", value: 3 },
];

export default function Dashboard() {
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold mb-4">Welcome back!</h1>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Total New Accounts
          </p>
          <p className="text-3xl font-bold mt-2">1,550</p>
          <p className="text-sm text-gray-500 mt-1">last 30 days</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Total Events Created
          </p>
          <p className="text-3xl font-bold mt-2">400</p>
          <p className="text-sm text-gray-500 mt-1">last 30 days</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <PieChartCard
          title="New Accounts By Plans"
          data={pieData}
          colors={["#84cc16", "#ec4899"]}
          loading={loading}
        />

        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">
            Top 5 Most Used Features
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
