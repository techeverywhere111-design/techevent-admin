import { createBrowserRouter } from "react-router-dom";
import Login from "@/features/auth/pages/Login";
import Signup from "@/features/auth/pages/Signup";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import AnalyticsAndInsights from "@/pages/AnalyticsAndInsight";
import Plans from "@/pages/Plans";
import PlanForm from "@/pages/PlanForm";
import ViewPlans from "@/pages/ViewPlans";
import ClientManagement from "@/pages/ClientManagement";
import ClientProfile from "@/pages/ClientProfile";
import { PrivateRoute } from "@/components/PrivateRoute";
import EventCategory from "@/pages/EventCategory";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "clients", element: <Plans /> },
      { path: "payments", element: <Plans /> },
      { path: "analytics-and-insight", element: <AnalyticsAndInsights /> },
      { path: "plans", element: <Plans /> },
      { path: "plan-creation", element: <PlanForm /> },
      { path: "view-plans", element: <ViewPlans /> },
      { path: "client-management", element: <ClientManagement /> },
      { path: "client-profile", element: <ClientProfile /> },
      { path: "event-category", element: <EventCategory /> },
    ],
  },
]);
