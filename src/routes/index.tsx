import { createBrowserRouter } from "react-router-dom";
import Login from "@/features/auth/pages/Login";
import Layout from "@/components/layout/Layout";
import RootLayout from "@/components/layout/RootLayout";
import Dashboard from "@/pages/Dashboard";
import AnalyticsAndInsights from "@/pages/AnalyticsAndInsight";
import Plans from "@/pages/Plans";
import PlanForm from "@/pages/PlanForm";
// import PaymentHistory from "@/pages/PaymentHistory";

import ClientManagement from "@/pages/ClientManagement";
import ClientProfile from "@/pages/ClientProfile";
import AuditLogs from "@/pages/ClientAuditLogs";

import { PrivateRoute } from "@/components/PrivateRoute";
import EventCategory from "@/pages/EventCategory";
import UserManagement from "@/pages/UserManagement";
import UserProfile from "@/pages/UserProfile";
import PromoCode from "@/pages/PromoCode";
import ViewPromoRegistration from "@/pages/ViewPromoRegistration";
import Enquiries from "@/pages/Enquiries";
import EnquiryDetails from "@/pages/EnquiryDetails";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PermissionGuard } from "@/components/PermissionGuard";
import Permissions from "@/pages/Permissions";
import Roles from "@/pages/Roles";
import ErrorPage from "@/pages/ErrorPage";
import SuspiciousUsersActivity from "@/pages/SuspiciousUsersActivity";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/",
        element: (
          <PrivateRoute>
            <ErrorBoundary>
              <Layout />
            </ErrorBoundary>
          </PrivateRoute>
        ),
        children: [
          { path: "dashboard", element: <PermissionGuard requires="view_dashboard"><Dashboard /></PermissionGuard> },
          { path: "clients", element: <PermissionGuard requires="view_plans"><Plans /></PermissionGuard> },
          // { path: "payments", element: <PermissionGuard requires="view_payments"><PaymentHistory /></PermissionGuard> },
          { path: "analytics-and-insight", element: <PermissionGuard requires="view_analytics"><AnalyticsAndInsights /></PermissionGuard> },
          { path: "plans", element: <PermissionGuard requires="view_plans"><Plans /></PermissionGuard> },
          { path: "plan-creation", element: <PermissionGuard requires="view_plans"><PlanForm /></PermissionGuard> },

          { path: "client-management", element: <PermissionGuard requires="view_clients"><ClientManagement /></PermissionGuard> },
          { path: "client-profile", element: <PermissionGuard requires="view_clients"><ClientProfile /></PermissionGuard> },
          { path: "audit-logs", element: <PermissionGuard requires="view_audit_logs"><AuditLogs /></PermissionGuard> },
          { path: "event-category", element: <PermissionGuard requires="view_events"><EventCategory /></PermissionGuard> },

          { path: "user-management", element: <PermissionGuard requires="view_users"><UserManagement /></PermissionGuard> },
          { path: "user-profile", element: <PermissionGuard requires="view_users"><UserProfile /></PermissionGuard> },
          { path: "promo-code", element: <PermissionGuard requires="view_discounts"><PromoCode /></PermissionGuard> },
          { path: "profile", element: <UserProfile /> },
          { path: "promo-enquires", element: <PermissionGuard requires="view_discounts"><ViewPromoRegistration /></PermissionGuard> },
          { path: "enquiries", element: <PermissionGuard requires="view_enquiries"><Enquiries /></PermissionGuard> },
          { path: "enquiries/:id", element: <PermissionGuard requires="view_enquiries"><EnquiryDetails /></PermissionGuard> },

          { path: "permissions", element: <PermissionGuard requires="view_roles"><Permissions /></PermissionGuard> },
          { path: "roles", element: <PermissionGuard requires="view_roles"><Roles /></PermissionGuard> },
          { path: "suspicious-users-activity", element: <PermissionGuard requires="view_security"><SuspiciousUsersActivity /></PermissionGuard> },
        ],
      },
    ],
  },
]);


