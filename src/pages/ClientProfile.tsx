import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ClientProfileCard from "@/components/ui/ClientProfileCard";
import ClientChartCard from "@/components/ui/ClientChartCard";
import { GetBulkAccountUsers, type AccountUser } from "@/lib/api/UserEndPoint";
import { toast } from "react-toastify";

const generateChartData = (
  days: number,
  type: "payment" | "events" | "meetings"
) => {
  const data = [];
  for (let i = 1; i <= days; i++) {
    const value =
      type === "payment"
        ? Math.floor(Math.random() * 300) + 200
        : Math.floor(Math.random() * 60) + 20;
    data.push({ day: i.toString().padStart(2, "0"), value });
  }
  return data;
};

import { useQuery } from "@tanstack/react-query";

const ClientProfile: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [paymentMonth, setPaymentMonth] = useState("Jan");
  const [paymentYear, setPaymentYear] = useState("2025");
  const [eventsMonth, setEventsMonth] = useState("Jan");
  const [eventsYear, setEventsYear] = useState("2025");
  const [meetingsMonth, setMeetingsMonth] = useState("Jan");
  const [meetingsYear, setMeetingsYear] = useState("2025");

  const paymentData = generateChartData(30, "payment");
  const eventsData = generateChartData(30, "events");
  const meetingsData = generateChartData(30, "meetings");

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

  useEffect(() => {
    if (!userId) {
      toast.error("No user ID provided");
      navigate("/client-management");
    }
  }, [userId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (!accountUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 transition-colors duration-300">
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
          title="Payment Flow"
          data={paymentData}
          dataKey="value"
          type="line"
          color="#10b981"
          showMonthYear
          selectedMonth={paymentMonth}
          selectedYear={paymentYear}
          onMonthChange={setPaymentMonth}
          onYearChange={setPaymentYear}
        />

        <ClientChartCard
          title="Event Creation Activity"
          data={eventsData}
          dataKey="value"
          type="bar"
          color="#1e40af"
          showMonthYear
          selectedMonth={eventsMonth}
          selectedYear={eventsYear}
          onMonthChange={setEventsMonth}
          onYearChange={setEventsYear}
        />

        <ClientChartCard
          title="Meeting Creation Activity"
          data={meetingsData}
          dataKey="value"
          type="bar"
          color="#3b82f6"
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
