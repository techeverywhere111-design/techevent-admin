import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PieChartCard from "@/components/ui/PieChartCard";
import { useQuery } from "@tanstack/react-query";
import { GetTotalCreatedAccounts, GetAccountPlanStatistics } from "@/lib/api/UserEndPoint";
import { GetTotalCreatedEvents } from "@/lib/api/EventManagement";
import { GetFeatureUsageBreakdown } from "@/lib/api/AuditLogEndpoint";
import { GetTopEnquiryCategories } from "@/lib/api/EnquiriesEndpoint";
import { type FeatureBreakdownResponse } from "@/lib/schemas";
import { type ChartData } from "@/types/chart";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import CustomShapeBarChart from "@/components/ui/CustomShapeBarChart";
import { isPermissionDeniedError } from "@/lib/utils/api";
import { ShieldX } from "lucide-react";

const PLAN_COLORS = ["#84cc16", "#ec4899", "#3b82f6", "#f59e0b", "#8b5cf6"];
const TOP_ENQUIRY_CATEGORY_COUNT = 5;

const mapBreakdownToChartData = (data?: FeatureBreakdownResponse, fallback: ChartData[] = []): ChartData[] => {
  const mapped = data?.columns.map((col) => ({ name: col.feature, value: col.totalCount })) ?? [];
  return mapped.length > 0 ? mapped : fallback;
};

const DEFAULT_PLAN_DATA: ChartData[] = [
  { name: "Personal", value: 0 },
  { name: "Business", value: 0 },
];

const DEFAULT_FEATURE_USAGE: ChartData[] = [
  { name: "Events", value: 0 },
  { name: "Meetings", value: 0 },
  { name: "Q&A", value: 0 },
  { name: "Polls", value: 0 },
  { name: "Others", value: 0 },
];

const formatEnquiryCategory = (category: string | null) => {
  if (!category) return "Uncategorized";

  return category
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function Dashboard() {

  const { startTime, endTime } = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return {
      startTime: thirtyDaysAgo.toISOString(),
      endTime: now.toISOString(),
    };
  }, []);

  const { data: totalAccountsData, isLoading: totalAccountsLoading, error: totalAccountsError } = useQuery({
    queryKey: ["totalCreatedAccounts", startTime, endTime],
    queryFn: () => GetTotalCreatedAccounts(startTime, endTime),
  });

  const { data: totalEventsData, isLoading: totalEventsLoading, error: totalEventsError } = useQuery({
    queryKey: ["totalCreatedEvents", startTime, endTime],
    queryFn: () => GetTotalCreatedEvents(startTime, endTime),
  });

  const { data: planStatsData, isLoading: planStatsLoading, error: planStatsError } = useQuery({
    queryKey: ["accountPlanStatistics"],
    queryFn: GetAccountPlanStatistics,
  });

  const { data: featureUsageData, isLoading: featureUsageLoading, error: featureUsageError } = useQuery({
    queryKey: ["featureUsageBreakdown", startTime, endTime],
    queryFn: () => GetFeatureUsageBreakdown(startTime, endTime),
  });

  const { data: topEnquiryCategories = [], isLoading: topEnquiryCategoriesLoading, error: topEnquiryCategoriesError } = useQuery({
    queryKey: ["topEnquiryCategories", TOP_ENQUIRY_CATEGORY_COUNT, startTime, endTime],
    queryFn: () =>
      GetTopEnquiryCategories(TOP_ENQUIRY_CATEGORY_COUNT, startTime, endTime),
  });

  const chartData = useMemo(() => {
    if (!featureUsageData || featureUsageData.columns.length === 0) {
      return DEFAULT_FEATURE_USAGE;
    }
    return featureUsageData.columns
      .map((col) => ({ name: col.feature, value: col.totalCount }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [featureUsageData]);

  const topEnquiryCategoryChartData = useMemo<ChartData[]>(
    () =>
      topEnquiryCategories.map(({ enquiryCategory, count }) => ({
        name: formatEnquiryCategory(enquiryCategory),
        value: count,
      })),
    [topEnquiryCategories]
  );

  return (
    <div className="p-4 sm:p-5 space-y-5">
      <h1 className="text-xl font-semibold mb-4">Welcome back!</h1>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Total New Accounts
          </p>
          {totalAccountsLoading ? (
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-3xl font-bold mt-2">
              {totalAccountsData ? totalAccountsData.totalCount.toLocaleString() : "0"}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">last 30 days</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Total Events Created
          </p>
          {totalEventsLoading ? (
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-3xl font-bold mt-2">
              {totalEventsData ? totalEventsData.totalCount.toLocaleString() : "0"}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">last 30 days</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <PieChartCard
          title="New Accounts By Plans"
          data={mapBreakdownToChartData(planStatsData, DEFAULT_PLAN_DATA)}
          colors={PLAN_COLORS}
          loading={planStatsLoading}
          isUnauthorized={isPermissionDeniedError(planStatsError)}
        />

        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">
            Top 5 Most Used Features
          </h3>
          {featureUsageLoading ? (
            <SkeletonLoader height="h-[250px]" />
          ) : isPermissionDeniedError(featureUsageError) ? (
            <div className="flex flex-col items-center justify-center h-[250px] text-center p-4">
              <ShieldX size={32} className="text-red-500 mb-2" />
              <p className="text-xs font-medium text-red-500">
                This user is not authorized to view this
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip formatter={(value) => [value, "Usage"]} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-1">Top Enquiry Categories</h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Last 30 days</p>
        {topEnquiryCategoriesLoading ? (
          <SkeletonLoader height="h-[320px]" />
        ) : topEnquiryCategoryChartData.length === 0 ? (
          <div className="flex h-[320px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            No enquiries were recorded in this period.
          </div>
        ) : (
          <CustomShapeBarChart
            data={topEnquiryCategoryChartData}
            isUnauthorized={isPermissionDeniedError(topEnquiryCategoriesError)}
          />
        )}
      </div>
    </div>
  );
}

