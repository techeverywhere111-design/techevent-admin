import { createBrowserRouter } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
// import ClientManagement from "@/pages/ClientManagement";
// import PaymentHistory from "@/pages/PaymentHistory";
import AnalyticsAndInsights from "@/pages/AnalyticsAndInsight";
import Plans from "@/pages/Plans";
import PlanForm from "@/pages/PlanForm";
import PaymentHistory from "@/pages/PaymentHistory";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "", element: <Dashboard /> },
      { path: "clients", element: <Plans /> },
      { path: "payments", element: <PaymentHistory /> },
      { path: "analytics-and-insight", element: <AnalyticsAndInsights /> },
      { path: "plans", element: <Plans /> },
      { path: "plan-creation", element: <PlanForm /> },
    ],
  },
]);
