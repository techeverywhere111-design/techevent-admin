import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import Layout from "@/components/layout/Layout";
import RootLayout from "@/components/layout/RootLayout";
import { PrivateRoute } from "@/components/PrivateRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PermissionGuard } from "@/components/PermissionGuard";
import { ROUTE_PERMISSIONS } from "@/lib/permissions";
import ErrorPage from "@/pages/ErrorPage";

const Login = lazy(() => import("@/features/auth/pages/Login"));
const CompleteRegistration = lazy(
  () => import("@/features/auth/pages/CompleteRegistration")
);
const CompleteResetPassword = lazy(
  () => import("@/features/auth/pages/CompleteResetPassword")
);
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AnalyticsAndInsights = lazy(() => import("@/pages/AnalyticsAndInsight"));
const Plans = lazy(() => import("@/pages/Plans"));
const PlanForm = lazy(() => import("@/pages/PlanForm"));
const PaymentHistory = lazy(() => import("@/pages/PaymentHistory"));
const ClientManagement = lazy(() => import("@/pages/ClientManagement"));
const ClientProfile = lazy(() => import("@/pages/ClientProfile"));
const AuditLogs = lazy(() => import("@/pages/ClientAuditLogs"));
const ClientPaymentHistory = lazy(() => import("@/pages/ClientPaymentHistory"));
const EventCategory = lazy(() => import("@/pages/EventCategory"));
const UserManagement = lazy(() => import("@/pages/UserManagement"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const PromoCode = lazy(() => import("@/pages/PromoCode"));
const ViewPromoRegistration = lazy(() => import("@/pages/ViewPromoRegistration"));
const Enquiries = lazy(() => import("@/pages/Enquiries"));
const EnquiryDetails = lazy(() => import("@/pages/EnquiryDetails"));
const Permissions = lazy(() => import("@/pages/Permissions"));
const Roles = lazy(() => import("@/pages/Roles"));
const SuspiciousUsersActivity = lazy(
  () => import("@/pages/SuspiciousUsersActivity")
);

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
        path: "complete-reset-password",
        element: <CompleteResetPassword />,
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
            path: "clients/:accountId/payments",
            element: (
              <PermissionGuard requires={ROUTE_PERMISSIONS.clients}>
                <ClientPaymentHistory />
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
