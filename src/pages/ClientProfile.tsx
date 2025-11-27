import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import ClientProfileCard from "@/components/ui/ClientProfileCard";
import ClientChartCard from "@/components/ui/ClientChartCard";

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

const ClientProfile: React.FC = () => {
  const [paymentMonth, setPaymentMonth] = useState("Jan");
  const [paymentYear, setPaymentYear] = useState("2025");
  const [eventsMonth, setEventsMonth] = useState("Jan");
  const [eventsYear, setEventsYear] = useState("2025");
  const [meetingsMonth, setMeetingsMonth] = useState("Jan");
  const [meetingsYear, setMeetingsYear] = useState("2025");

  const profileData = {
    firstName: "Jane",
    lastName: "Doe",
    email: "janedoe123@gmail.com",
    planType: "Personal",
    dateJoined: "20-09-2024",
    profileImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  };

  const paymentData = generateChartData(30, "payment");
  const eventsData = generateChartData(30, "events");
  const meetingsData = generateChartData(30, "meetings");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Clients Management
        </h1>

        <button
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6"
          onClick={() => window.history.back()}
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
