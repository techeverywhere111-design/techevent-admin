import { useState, useEffect } from "react";
import StatCard from "@/components/ui/StatCard";
import PieChartCard from "@/components/ui/PieChartCard";
import BarChartCard from "@/components/ui/BarChartCard";
import LineChartCard from "@/components/ui/LineChartCard";
import DonutChartCard from "@/components/ui/DonutChartCard";

interface Stat {
  title: string;
  value: string | number;
}

interface ChartData {
  name: string;
  value: number;
}

interface LineData {
  month: string;
  currentYear: number;
  lastYear: number;
}

export default function AnalyticsAndInsights(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);

  const barColors1: string[] = ["#0F3D74", "#0065FF", "#CADDF5ED"];
  const barColors2: string[] = ["#0F3D74", "#0065FF", "#CADDF5ED"];
  const barSize: number = 60;

  const statData: Stat[] = [
    { title: "Total Accounts", value: "12,550" },
    { title: "Total Users Registered", value: "25,320" },
    { title: "Total Events Created", value: "5,400" },
    { title: "Total Meetings Created", value: "18,760" },
  ];

  const pieData1: ChartData[] = [
    { name: "Paid", value: 40 },
    { name: "Free", value: 60 },
  ];

  const pieData3: ChartData[] = [
    { name: "Personal", value: 40 },
    { name: "Business", value: 60 },
  ];

  const barData1: ChartData[] = [
    { name: "Free", value: 40 },
    { name: "Personal", value: 55 },
    { name: "Business", value: 70 },
  ];

  const barData2: ChartData[] = [
    { name: "Virtual", value: 700 },
    { name: "Hybrid", value: 300 },
    { name: "Physical", value: 200 },
  ];

  const lineData: LineData[] = [
    { month: "Jan", currentYear: 65, lastYear: 70 },
    { month: "Feb", currentYear: 25, lastYear: 30 },
    { month: "Mar", currentYear: 89, lastYear: 65 },
    { month: "Apr", currentYear: 50, lastYear: 55 },
    { month: "May", currentYear: 48, lastYear: 85 },
    { month: "Jun", currentYear: 90, lastYear: 58 },
    { month: "Jul", currentYear: 70, lastYear: 55 },
    { month: "Aug", currentYear: 35, lastYear: 75 },
    { month: "Sep", currentYear: 28, lastYear: 80 },
    { month: "Oct", currentYear: 190, lastYear: 90 },
    { month: "Nov", currentYear: 120, lastYear: 60 },
    { month: "Dec", currentYear: 25, lastYear: 75 },
  ];

  const donutData: ChartData[] = [
    { name: "Polls", value: 45 },
    { name: "Q&A", value: 28 },
    { name: "Meetings", value: 12 },
    { name: "Events", value: 15 },
  ];

  const donutColors: string[] = ["#85D238", "#E6235A", "#237BE6", "#113D73"];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 md:p-8 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <div className="flex justify-end text-sm text-gray-600 dark:text-gray-400 mb-2">
        Log out
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Analytics and Insight
      </h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statData.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            value={item.value}
            loading={loading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <PieChartCard
          title="Free vs Paid Accounts"
          data={pieData1}
          colors={["#3b82f6", "#60a5fa"]}
          loading={loading}
        />
        <DonutChartCard
          title="Frequency of Polls, Q&A, Meetings, Events"
          data={donutData}
          colors={donutColors}
          loading={loading}
        />
        <PieChartCard
          title="Revenue Spread Across Subscription Plans"
          data={pieData3}
          colors={["#f43f5e", "#10b981"]}
          loading={loading}
        />
      </div>

      {/* Bar Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <BarChartCard
          title="Accounts Per Plan"
          data={barData1}
          xKey="name"
          barKey="value"
          barSize={barSize}
          colors={barColors1}
          yAxisLabel="Number of Accounts"
          loading={false}
          chartType="Plan Type"
        />
        <BarChartCard
          title="Frequency of Virtual vs Hybrid vs Physical Events"
          data={barData2}
          xKey="name"
          barKey="value"
          barSize={barSize}
          colors={barColors2}
          yAxisLabel="Number of Events"
          loading={false}
          chartType="Event Type"
        />
      </div>

      {/* Line Chart */}
      <LineChartCard
        title="Subscription Payment Flow"
        data={lineData}
        loading={loading}
      />
    </div>
  );
}
