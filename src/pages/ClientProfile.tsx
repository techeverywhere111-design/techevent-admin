import React, { useEffect, useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ClientProfileCard from "@/components/ui/ClientProfileCard";
import ClientChartCard from "@/components/ui/ClientChartCard";
import { GetBulkAccountUsers } from "@/lib/api/UserEndPoint";
import {
  GetClientDailyMeetingCreation,
  GetClientDailyEventCreation,
} from "@/lib/api/MeetingEndpoint";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import AppLoader from "@/components/ui/AppLoader";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];


const buildTimestamp = (monthAbbr: string, year: string): string => {
  const monthIndex = MONTHS.indexOf(monthAbbr);
  return new Date(Date.UTC(parseInt(year), monthIndex, 1)).toISOString();
};

const mapColumnsToChartData = (
  columns: { day: number; totalCount: number }[] | undefined
) => {
  if (!columns) return [];
  return columns.map((col) => ({
    day: col.day.toString().padStart(2, "0"),
    value: col.totalCount,
  }));
};

const ClientProfile: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const now = new Date();
  const currentMonthAbbr = MONTHS[now.getMonth()];
  const currentYear = now.getFullYear().toString();

  const [eventsMonth, setEventsMonth] = useState(currentMonthAbbr);
  const [eventsYear, setEventsYear] = useState(currentYear);
  const [meetingsMonth, setMeetingsMonth] = useState(currentMonthAbbr);
  const [meetingsYear, setMeetingsYear] = useState(currentYear);

  const getUserId = (): string | null => {
    const query = location.search;
    if (query.startsWith("?") && query.length > 1) {
      return query.substring(1);
    }
    return null;
  };

  const userId = getUserId();

  const { data: accountUser, isLoading: loading } = useQuery({
    queryKey: ["clientProfile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID provided");
      const users = await GetBulkAccountUsers([userId]);
      const user = users[0];
      if (!user) throw new Error("User not found");
      return user;
    },
    enabled: !!userId,
  });

  const accountId = accountUser?.accountId;

  // Events
  const eventsTimestamp = useMemo(
    () => buildTimestamp(eventsMonth, eventsYear),
    [eventsMonth, eventsYear]
  );

  const {
    data: eventsApiData,
    isLoading: eventsLoading,
    isFetching: eventsFetching,
  } = useQuery({
    queryKey: ["clientEventCreation", accountId, eventsTimestamp],
    queryFn: () => GetClientDailyEventCreation(accountId!, eventsTimestamp),
    enabled: !!accountId,
  });

  const eventsChartData = useMemo(
    () => mapColumnsToChartData(eventsApiData?.columns),
    [eventsApiData]
  );

  // Meetings
  const meetingsTimestamp = useMemo(
    () => buildTimestamp(meetingsMonth, meetingsYear),
    [meetingsMonth, meetingsYear]
  );

  const {
    data: meetingsApiData,
    isLoading: meetingsLoading,
    isFetching: meetingsFetching,
  } = useQuery({
    queryKey: ["clientMeetingCreation", accountId, meetingsTimestamp],
    queryFn: () => GetClientDailyMeetingCreation(accountId!, meetingsTimestamp),
    enabled: !!accountId,
  });

  const meetingsChartData = useMemo(
    () => mapColumnsToChartData(meetingsApiData?.columns),
    [meetingsApiData]
  );

  useEffect(() => {
    if (!userId) {
      toast.error("No user ID provided");
      navigate("/client-management");
    }
  }, [userId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <AppLoader fullScreen={false} />
        </div>
      </div>
    );
  }

  if (!accountUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600 dark:text-gray-300">
            User not found
          </p>
        </div>
      </div>
    );
  }

  const profileData = {
    firstName: accountUser.firstName,
    lastName: accountUser.lastName,
    name: accountUser.name,
    email: accountUser.email,
    planType: "Personal",
    dateJoined: accountUser.createdOn,
    profileImage: accountUser.imageUrl,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Clients Management
        </h1>

        <button
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Profile</span>
        </button>

        <ClientProfileCard {...profileData} />


        <ClientChartCard
          title="Event Creation Activity"
          data={eventsChartData}
          dataKey="value"
          type="bar"
          color="#1e40af"
          loading={eventsLoading || eventsFetching}
          showMonthYear
          selectedMonth={eventsMonth}
          selectedYear={eventsYear}
          onMonthChange={setEventsMonth}
          onYearChange={setEventsYear}
        />

        <ClientChartCard
          title="Meeting Creation Activity"
          data={meetingsChartData}
          dataKey="value"
          type="bar"
          color="#3b82f6"
          loading={meetingsLoading || meetingsFetching}
          showMonthYear
          selectedMonth={meetingsMonth}
          selectedYear={meetingsYear}
          onMonthChange={setMeetingsMonth}
          onYearChange={setMeetingsYear}
        />
      </div>
    </div>
  );
};

export default ClientProfile;
