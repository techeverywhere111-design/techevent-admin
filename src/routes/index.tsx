import { createBrowserRouter } from "react-router-dom";
import Login from "@/features/auth/pages/Login";
import CompleteRegistration from "@/features/auth/pages/CompleteRegistration";
import Layout from "@/components/layout/Layout";
import RootLayout from "@/components/layout/RootLayout";
import Dashboard from "@/pages/Dashboard";
import AnalyticsAndInsights from "@/pages/AnalyticsAndInsight";
import Plans from "@/pages/Plans";
import PlanForm from "@/pages/PlanForm";
import PaymentHistory from "@/pages/PaymentHistory";

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
import { ROUTE_PERMISSIONS } from "@/lib/permissions";
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
        path: "complete-registration",
        element: <CompleteRegistration />,
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
          {
            path: "dashboard",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.dashboard}>
                <Dashboard />
              </PermissionGuard>
            ),
          },
          {
            path: "clients",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.plans}>
                <Plans />
              </PermissionGuard>
            ),
          },
          {
            path: "payments",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.paymentHistory}>
                <PaymentHistory />
              </PermissionGuard>
            ),
          },
          {
            path: "analytics-and-insight",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.analytics}>
                <AnalyticsAndInsights />
              </PermissionGuard>
            ),
          },
          {
            path: "plans",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.plans}>
                <Plans />
              </PermissionGuard>
            ),
          },
          {
            path: "plan-creation",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.planCreation}>
                <PlanForm />
              </PermissionGuard>
            ),
          },

          {
            path: "client-management",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.clients}>
                <ClientManagement />
              </PermissionGuard>
            ),
          },
          {
            path: "client-profile",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.clientProfile}>
                <ClientProfile />
              </PermissionGuard>
            ),
          },
          {
            path: "audit-logs",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.auditLogs}>
                <AuditLogs />
              </PermissionGuard>
            ),
          },
          {
            path: "event-category",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.eventCategories}>
                <EventCategory />
              </PermissionGuard>
            ),
          },

          {
            path: "user-management",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.adminUsers}>
                <UserManagement />
              </PermissionGuard>
            ),
          },
          {
            path: "user-profile",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.adminUserProfile}>
                <UserProfile />
              </PermissionGuard>
            ),
          },
          {
            path: "promo-code",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.promoCodes}>
                <PromoCode />
              </PermissionGuard>
            ),
          },
          { path: "profile", element: <UserProfile /> },
          {
            path: "promo-enquires",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.promoCodeLogs}>
                <ViewPromoRegistration />
              </PermissionGuard>
            ),
          },
          {
            path: "enquiries",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.enquiries}>
                <Enquiries />
              </PermissionGuard>
            ),
          },
          {
            path: "enquiries/:id",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.enquiryDetails}>
                <EnquiryDetails />
              </PermissionGuard>
            ),
          },

          {
            path: "permissions",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.permissions}>
                <Permissions />
              </PermissionGuard>
            ),
          },
          {
            path: "roles",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.roles}>
                <Roles />
              </PermissionGuard>
            ),
          },
          {
            path: "suspicious-users-activity",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.suspiciousUsers}>
                <SuspiciousUsersActivity />
              </PermissionGuard>
            ),
          },
        ],
      },
    ],
  },
]);
