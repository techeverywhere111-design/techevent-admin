# Plutospace Event Admin

Plutospace Event Admin is the internal admin dashboard for managing and monitoring the Plutospace Event platform. It is a React, TypeScript, and Vite application that gives administrators access to operational dashboards, user and client management, plans, event categories, enquiries, promo codes, roles, permissions, and suspicious activity monitoring.

The application is built around three main ideas:

- Authenticated admin access.
- Role-based permission control.
- Typed API integration with runtime response validation.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack React Query
- Zustand
- Axios
- Zod
- Tailwind CSS
- Recharts
- Lucide React
- React Toastify

## Project Structure

```text
src/
  assets/               Static images and branding assets
  components/           Shared UI, route guards, layout, and error handling
  components/layout/    Sidebar, navbar, root layout, and app shell
  components/ui/        Reusable cards, tables, loaders, and chart wrappers
  context/              Auth, theme, and app-level context providers
  features/auth/        Login and registration-related auth screens
  hooks/                Shared hooks such as permission hydration
  lib/
    api/                Backend endpoint wrappers by business area
    utils/api.ts        Shared Axios client and auth interceptors
    schemas.ts          Zod schemas and inferred TypeScript types
    react-query.ts      React Query client configuration
  pages/                Top-level route pages
  routes/               React Router route tree
  store/                Zustand stores
  styles/               Tailwind/global CSS
  types/                Shared TypeScript-only types
```

## Application Flow

The app starts in `src/main.tsx`, which renders `src/App.tsx`.

`App.tsx` wires the global providers:

- `QueryClientProvider` for server-state caching.
- `AppProvider` for generic app-level state.
- `AuthProvider` for persisted admin user state.
- `ThemeProvider` for light/dark mode.
- `RouterProvider` for the route tree.
- `ToastContainer` for app-wide notifications.

Routes are declared in `src/routes/index.tsx`. Public routes include login and invite completion. Private routes are wrapped with `PrivateRoute`, rendered inside the main `Layout`, and usually protected again by `PermissionGuard`.

## Authentication

Authentication state lives in `src/context/AuthContext.tsx`.

After a successful login:

1. `Login.tsx` calls `AdminUserLogin`.
2. The returned admin user is stored in the `PLUTO_EVENT_ADMIN_USER` cookie.
3. The app navigates to `/dashboard`.
4. The shared Axios client handles the auth token through the `x-token-ch` header.

The token is managed in `src/lib/utils/api.ts`:

- Every request reads `PLUTO_EVENT_ADMIN_TOKEN` from cookies.
- If a token exists, it is sent as `x-token-ch`.
- If a response contains a new `x-token-ch`, it is saved back to cookies.
- A `401` clears auth cookies and redirects to login.
- A `403` invalidates permissions and shows an access error toast.

## Permissions And Role-Based Access

Permissions are central to how the dashboard works.

The permission store is implemented in `src/store/permissionStore.ts` using Zustand. When the private layout mounts, `src/hooks/useHydratePermissions.ts` fetches permissions for the current admin role using `GetRolePermissions`.

Access is enforced in two places:

- `PermissionGuard` protects route-level access.
- `Sidebar` filters navigation items based on the same permission names.

`SUPER_ADMIN` bypasses permission checks and receives full access.

Common permission names include:

- `view_dashboard`
- `view_clients`
- `view_audit_logs`
- `view_events`
- `view_payments`
- `view_analytics`
- `view_plans`
- `view_enquiries`
- `view_users`
- `view_discounts`
- `view_roles`
- `view_security`

Roles and permissions are managed in `src/pages/Roles.tsx`, where permissions can be assigned to or removed from supported roles.

## API Layer

Backend calls are grouped by business domain under `src/lib/api`.

Important API modules include:

- `AdminEndpoint.tsx` for admin login, admin user listing, invites, re-invites, pending invite deletion, and invite completion.
- `AdminPermissionEndpoint.ts` for fetching, assigning, and removing role permissions.
- `Plans.tsx` for creating, editing, listing, searching, activating, and deactivating subscription plans.
- `UserEndPoint.tsx` for client/account users and account statistics.
- `EventManagement.tsx` for event categories and event statistics.
- `DiscountManagement.tsx` for promo codes and promo registration logs.
- `EnquiriesEndpoint.ts` for enquiry listing, details, status updates, and top-category reporting.
- `AuditLogEndpoint.ts` for audit logs and feature usage analytics.
- `SuspiciousUsersEndpoint.ts` for suspicious users and suspicious activity records.
- `PlanPaymentEndpoint.ts` for plan payment and subscription analytics.
- `MeetingEndpoint.ts` for meeting analytics.
- `PermissionEndpoint.ts` for platform permissions.

Most API functions follow this pattern:

```ts
const { data } = await api.get("/api/v1/example");
return ExampleSchema.parse(data);
```

This means backend responses are validated at runtime with Zod before page components use the data.

## Data Fetching Pattern

Pages use TanStack React Query for server state.

The common page pattern is:

1. Keep UI state locally, such as search text, active filter, selected page, modal state, or drawer state.
2. Use `useQuery` with a stable query key that includes filter and pagination values.
3. Call the matching API module inside `queryFn`.
4. Render loading, empty, error, and success states.
5. Use `useMutation` for writes.
6. Invalidate affected query keys after successful mutations.

For example, the plans page uses:

- `["plans", activeSearchTerm, page, itemsPerPage]` for plan listing/searching.
- `PlanActivate` and `PlanDeactivate` mutations.
- `queryClient.invalidateQueries({ queryKey: ["plans"] })` after status changes.

## Main Feature Areas

### Dashboard

`src/pages/Dashboard.tsx` shows a short operational overview:

- New accounts over the last 30 days.
- Events created over the last 30 days.
- New accounts by plan.
- Top feature usage.
- Top five enquiry categories by request volume.

#### Dashboard enquiry-category report

The dashboard uses the reusable `CustomShapeBarChart` component, which accepts normalized `{ name, value }` data and has no enquiry-specific API or presentation logic. Its curved triangle-shaped bars and category-specific colours can therefore be reused for any similarly shaped dashboard dataset. The enquiry report maps its response into this generic data shape before rendering.

```text
GET /api/v1/enquiries/5/top-requests?startTime={ISO-8601}&endTime={ISO-8601}
```

Its `startTime` and `endTime` reuse the dashboard's default rolling 30-day window. The API response is validated as an array of `{ enquiryCategory, count }` records before the chart renders. A missing (`null`) category is displayed as **Uncategorized**. Categories with no returned records display an empty-state message, while requests in progress show the dashboard loader.

### Analytics And Insight

`src/pages/AnalyticsAndInsight.tsx` provides broader reporting:

- Total accounts.
- Total registered users.
- Total events.
- Total meetings.
- Free vs paid accounts.
- Core feature usage.
- Revenue spread across subscription plans.
- Accounts per plan.
- Event type breakdown.
- Subscription payment flow year-over-year.

### Plans

`src/pages/Plans.tsx` lists subscription plans, supports search and pagination, displays feature details in a drawer, and allows admins to activate or deactivate plans.

`src/pages/PlanForm.tsx` handles both plan creation and editing. Plan features are modeled as nested feature categories:

- `meetingFeature`
- `eventFeature`
- `calendarFeature`
- `proposalFeature`
- `accountFeature`
- `pollFeature`

Before submit, the form converts UI state into the API payload by removing frontend-only fields like `enabled` and `errors`, then converting numeric strings into numbers.

### Client Management

Client management pages list account users, show profiles, and connect to client-specific activity and analytics data.

### Event Management

Event management currently focuses on event categories. Admins can create, update, delete, search, and paginate event categories.

### Enquiries

The enquiries pages list customer enquiries, show enquiry details, and allow admins to mark enquiries as treated or untreated.

### Discount Management

Promo code management supports creating and renewing promo codes, viewing promo registration logs, and marking promo settlements as settled or not settled.

### User Management

User management handles admin users. It supports listing/searching users, inviting admins, re-inviting pending admins, deleting pending invites, and showing whether an invited admin has accepted.

### Roles And Permissions

The roles screen manages which permissions are assigned to non-super-admin roles. It uses a two-column transfer interface: available permissions on one side, assigned permissions on the other.

### Suspicious Users And Activity

The suspicious activity section displays suspicious users and suspicious activity records for security monitoring.

## Environment

The app expects this Vite environment variable:

```env
VITE_API_BASE_URL=https://plutobackend.plutospace.xyz
```

The value is read by the Axios client in `src/lib/utils/api.ts`.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

Preview the production build:

```bash
npm run preview
```

## Important Implementation Notes

- Route-level protection and sidebar visibility should stay aligned. When adding a new protected route, add the corresponding sidebar permission and route `PermissionGuard`.
- API responses should be represented in `src/lib/schemas.ts` and parsed in the related API module.
- Mutations should invalidate the narrowest useful React Query key after success.
- `SUPER_ADMIN` is treated as an all-access role.
- The sidebar currently includes a `Payment History` item, while the `/payments` route is commented out. Re-enable or remove both together to avoid dead navigation.

## Adding A New Admin Feature

To add a new feature consistently:

1. Define or extend the Zod schema in `src/lib/schemas.ts`.
2. Add API wrapper functions under `src/lib/api`.
3. Create the page under `src/pages`.
4. Fetch data with React Query.
5. Add mutations with proper success/error handling.
6. Add a route in `src/routes/index.tsx`.
7. Protect the route with `PermissionGuard`.
8. Add a sidebar item in `src/components/layout/Sidebar.tsx`.
9. Create or reuse the matching backend permission name.
10. Assign that permission from the Roles screen.
