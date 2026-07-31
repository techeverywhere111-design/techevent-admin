import { useState, useMemo } from "react";
import StatCard from "@/components/ui/StatCard";
import PieChartCard from "@/components/ui/PieChartCard";
import BarChartCard from "@/components/ui/BarChartCard";
import LineChartCard from "@/components/ui/LineChartCard";
import DonutChartCard from "@/components/ui/DonutChartCard";
import { type ChartData } from "@/types/chart";
import { useQuery } from "@tanstack/react-query";
import { GetTotalAccounts, GetTotalAccountUsers, GetFreeVsPaidAccounts, GetAccountPlanStatistics } from "@/lib/api/UserEndPoint";
import { GetTotalEvents, GetEventTypeBreakdown } from "@/lib/api/EventManagement";
import { GetTotalMeetings } from "@/lib/api/MeetingEndpoint";
import { GetCoreFeatureBreakdown } from "@/lib/api/AuditLogEndpoint";
import { GetPlanTypeBreakdown, GetPlanSubscriptionYearOnYear } from "@/lib/api/PlanPaymentEndpoint";
import { type FeatureBreakdownResponse } from "@/lib/schemas";
import { isPermissionDeniedError } from "@/lib/utils/api";

interface Stat {
  title: string;
  value: string | number;
  loading: boolean;
  isUnauthorized?: boolean;
}

interface LineData {
  month: string;
  currentYear: number;
  lastYear: number;
}

const mapBreakdownToChartData = (data?: FeatureBreakdownResponse, fallback: ChartData[] = []): ChartData[] => {
  const mapped = data?.columns.map((col) => ({ name: col.feature, value: col.totalCount })) ?? [];
  return mapped.length > 0 ? mapped : fallback;
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getMonthIndex = (feature: string): number => {
  const clean = feature.toLowerCase().trim();
  const monthsFull = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const monthsShort = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

  let idx = monthsShort.indexOf(clean.substring(0, 3));
  if (idx !== -1) return idx;

  idx = monthsFull.indexOf(clean);
  if (idx !== -1) return idx;

  const num = parseInt(clean, 10);
  if (!isNaN(num)) {
    if (num >= 1 && num <= 12) return num - 1;
    if (num >= 0 && num <= 11) return num;
  }
  return -1;
};

const DEFAULT_FREE_VS_PAID: ChartData[] = [
  { name: "Paid", value: 0 },
  { name: "Free", value: 0 },
];

const DEFAULT_CORE_FEATURES: ChartData[] = [
  { name: "Polls", value: 0 },
  { name: "Q&A", value: 0 },
  { name: "Meetings", value: 0 },
  { name: "Events", value: 0 },
];

const DEFAULT_PLAN_TYPE: ChartData[] = [
  { name: "Personal", value: 0 },
  { name: "Business", value: 0 },
];

const DEFAULT_ACCOUNTS_PER_PLAN: ChartData[] = [
  { name: "Free", value: 0 },
  { name: "Personal", value: 0 },
  { name: "Business", value: 0 },
];

const DEFAULT_EVENT_TYPE: ChartData[] = [
  { name: "Virtual", value: 0 },
  { name: "Hybrid", value: 0 },
  { name: "Physical", value: 0 },
];

export default function AnalyticsAndInsights() {

  const currentYearVal = new Date().getFullYear();
  const comparisonYears = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => (currentYearVal - 1 - i).toString());
  }, [currentYearVal]);

  const [selectedComparisonYear, setSelectedComparisonYear] = useState<string>(
    comparisonYears[0] || (currentYearVal - 1).toString()
  );

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
    queryKey: ["totalAccounts"],
    queryFn: GetTotalAccounts,
  });

  const { data: totalEventsData, isLoading: totalEventsLoading, error: totalEventsError } = useQuery({
    queryKey: ["totalEvents"],
    queryFn: GetTotalEvents,
  });

  const { data: totalAccountUsersData, isLoading: totalAccountUsersLoading, error: totalAccountUsersError } = useQuery({
    queryKey: ["totalAccountUsers"],
    queryFn: GetTotalAccountUsers,
  });

  const { data: totalMeetingsData, isLoading: totalMeetingsLoading, error: totalMeetingsError } = useQuery({
    queryKey: ["totalMeetings"],
    queryFn: GetTotalMeetings,
  });

  const { data: freeVsPaidData, isLoading: freeVsPaidLoading, error: freeVsPaidError } = useQuery({
    queryKey: ["freeVsPaidAccounts"],
    queryFn: GetFreeVsPaidAccounts,
  });

  const { data: coreBreakdownData, isLoading: coreBreakdownLoading, error: coreBreakdownError } = useQuery({
    queryKey: ["coreFeatureBreakdown", startTime, endTime],
    queryFn: () => GetCoreFeatureBreakdown(startTime, endTime),
  });

  const { data: planTypeData, isLoading: planTypeLoading, error: planTypeError } = useQuery({
    queryKey: ["planTypeBreakdown", startTime, endTime],
    queryFn: () => GetPlanTypeBreakdown(startTime, endTime),
  });

  const { data: accountPlanData, isLoading: accountPlanLoading, error: accountPlanError } = useQuery({
    queryKey: ["accountPlanStatistics"],
    queryFn: GetAccountPlanStatistics,
  });

  const { data: eventTypeData, isLoading: eventTypeLoading, error: eventTypeError } = useQuery({
    queryKey: ["eventTypeBreakdown", startTime, endTime],
    queryFn: () => GetEventTypeBreakdown(startTime, endTime),
  });

  const { data: yearOnYearData, isLoading: yearOnYearLoading, error: yearOnYearError } = useQuery({
    queryKey: ["planSubscriptionYearOnYear", selectedComparisonYear],
    queryFn: () => {
      const now = new Date();
      const compareDate = new Date(now);
      compareDate.setFullYear(Number(selectedComparisonYear));
      return GetPlanSubscriptionYearOnYear(now.toISOString(), compareDate.toISOString());
    }
  });

  const lineData = useMemo(() => {
    const result: LineData[] = MONTH_LABELS.map(m => ({
      month: m,
      currentYear: 0,
      lastYear: 0
    }));

    if (!yearOnYearData || yearOnYearData.length < 2) {
      return result;
    }

    const currentYearCols = yearOnYearData[0]?.columns ?? [];
    currentYearCols.forEach(col => {
      const idx = getMonthIndex(col.feature);
      if (idx >= 0 && idx < 12) {
        result[idx].currentYear = col.totalCount;
      }
    });

    const lastYearCols = yearOnYearData[1]?.columns ?? [];
    lastYearCols.forEach(col => {
      const idx = getMonthIndex(col.feature);
      if (idx >= 0 && idx < 12) {
        result[idx].lastYear = col.totalCount;
      }
    });

    return result;
  }, [yearOnYearData]);

  const barColors1: string[] = ["#0F3D74", "#0065FF", "#CADDF5ED"];
  const barColors2: string[] = ["#0F3D74", "#0065FF", "#CADDF5ED"];
  const barSize: number = 60;

  const donutColors: string[] = ["#85D238", "#E6235A", "#237BE6", "#113D73"];

  const statData: Stat[] = [
    {
      title: "Total Accounts",
      value: totalAccountsData ? totalAccountsData.totalCount.toLocaleString() : "0",
      loading: totalAccountsLoading,
      isUnauthorized: isPermissionDeniedError(totalAccountsError),
    },
    {
      title: "Total Users Registered",
      value: totalAccountUsersData ? totalAccountUsersData.totalCount.toLocaleString() : "0",
      loading: totalAccountUsersLoading,
      isUnauthorized: isPermissionDeniedError(totalAccountUsersError),
    },
    {
      title: "Total Events Created",
      value: totalEventsData ? totalEventsData.totalCount.toLocaleString() : "0",
      loading: totalEventsLoading,
      isUnauthorized: isPermissionDeniedError(totalEventsError),
    },
    {
      title: "Total Meetings Created",
      value: totalMeetingsData ? totalMeetingsData.totalCount.toLocaleString() : "0",
      loading: totalMeetingsLoading,
      isUnauthorized: isPermissionDeniedError(totalMeetingsError),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-5 text-gray-800 dark:text-gray-100 transition-colors duration-300">
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
            loading={item.loading}
            isUnauthorized={item.isUnauthorized}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <PieChartCard
          title="Free vs Paid Accounts"
          data={mapBreakdownToChartData(freeVsPaidData, DEFAULT_FREE_VS_PAID)}
          colors={["#3b82f6", "#60a5fa"]}
          loading={freeVsPaidLoading}
          isUnauthorized={isPermissionDeniedError(freeVsPaidError)}
        />
        <DonutChartCard
          title="Frequency of Polls, Q&A, Meetings, Events"
          data={mapBreakdownToChartData(coreBreakdownData, DEFAULT_CORE_FEATURES)}
          colors={donutColors}
          loading={coreBreakdownLoading}
          isUnauthorized={isPermissionDeniedError(coreBreakdownError)}
        />
        <PieChartCard
          title="Revenue Spread Across Subscription Plans"
          data={mapBreakdownToChartData(planTypeData, DEFAULT_PLAN_TYPE)}
          colors={["#f43f5e", "#10b981", "#3b82f6", "#f59e0b"]}
          loading={planTypeLoading}
          isUnauthorized={isPermissionDeniedError(planTypeError)}
        />
      </div>

      {/* Bar Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <BarChartCard
          title="Accounts Per Plan"
          data={mapBreakdownToChartData(accountPlanData, DEFAULT_ACCOUNTS_PER_PLAN)}
          xKey="name"
          barKey="value"
          barSize={barSize}
          colors={barColors1}
          yAxisLabel="Number of Accounts"
          loading={accountPlanLoading}
          isUnauthorized={isPermissionDeniedError(accountPlanError)}
          chartType="Plan Type"
        />
        <BarChartCard
          title="Frequency of Virtual vs Hybrid vs Physical Events"
          data={mapBreakdownToChartData(eventTypeData, DEFAULT_EVENT_TYPE)}
          xKey="name"
          barKey="value"
          barSize={barSize}
          colors={barColors2}
          yAxisLabel="Number of Events"
          loading={eventTypeLoading}
          isUnauthorized={isPermissionDeniedError(eventTypeError)}
          chartType="Event Type"
        />
      </div>

      <LineChartCard
        title="Subscription Payment Flow"
        data={lineData}
        loading={yearOnYearLoading}
        isUnauthorized={isPermissionDeniedError(yearOnYearError)}
        selectedYear={selectedComparisonYear}
        onYearChange={setSelectedComparisonYear}
        comparisonYears={comparisonYears}
      />
    </div>
  );
}
