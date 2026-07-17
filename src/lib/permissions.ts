import type { Permission } from "@/lib/schemas";

export type PermissionRequirement =
  {
    endpoint?: string;
    method?: string;
    module?: string;
    anyOf?: PermissionRequirement[];
    allOf?: PermissionRequirement[];
  };

const normalize = (value: string) => value.trim().replace(/\/+$/, "");

const normalizeMethod = (method?: string) => method?.trim().toUpperCase();

const matchesPermission = (
  permission: Permission,
  requirement: PermissionRequirement
) => {
  if (requirement.endpoint) {
    if (normalize(permission.endpoint) !== normalize(requirement.endpoint)) {
      return false;
    }
  }

  if (requirement.method) {
    if (normalizeMethod(permission.method) !== normalizeMethod(requirement.method)) {
      return false;
    }
  }

  if (requirement.module) {
    if (permission.module.trim().toUpperCase() !== requirement.module.trim().toUpperCase()) {
      return false;
    }
  }

  return !!(requirement.endpoint || requirement.method || requirement.module);
};

const hasSinglePermissionRequirement = (
  permissions: Permission[],
  requirement: PermissionRequirement
): boolean => {
  if (requirement.anyOf) {
    return requirement.anyOf.some((childRequirement) =>
      hasSinglePermissionRequirement(permissions, childRequirement)
    );
  }

  if (requirement.allOf) {
    return requirement.allOf.every((childRequirement) =>
      hasSinglePermissionRequirement(permissions, childRequirement)
    );
  }

  return permissions.some((permission) =>
    matchesPermission(permission, requirement)
  );
};

export const hasPermissionRequirement = (
  permissions: Permission[],
  requirement?: PermissionRequirement
): boolean => {
  if (!requirement) return true;
  return hasSinglePermissionRequirement(permissions, requirement);
};

const get = (endpoint: string): PermissionRequirement => ({
  endpoint,
  method: "GET",
});

const post = (endpoint: string): PermissionRequirement => ({
  endpoint,
  method: "POST",
});

export const ROUTE_PERMISSIONS = {
  dashboard: {
    anyOf: [
      get("/api/v1/account-users/total-created-accounts"),
      get("/api/v1/events/total-created-events"),
      get("/api/v1/account-users/account-plan-statistics"),
      get("/api/v1/audit-logs/breakdown"),
    ],
  },
  analytics: {
    anyOf: [
      get("/api/v1/account-users/total-accounts"),
      get("/api/v1/account-users/total-account-users"),
      get("/api/v1/events/total-events"),
      get("/api/v1/meetings/total-meetings"),
      get("/api/v1/account-users/free-vs-paid-accounts"),
      get("/api/v1/audit-logs/breakdown/core"),
      get("/api/v1/plan-payment-histories/breakdown/plan-type"),
      get("/api/v1/account-users/account-plan-statistics"),
      get("/api/v1/events/physical-vs-hybrid-vs-virtual"),
      get("/api/v1/plan-payment-histories/breakdown/year-on-year"),
    ],
  },
  plans: {
    anyOf: [get("/api/v1/plans"), get("/api/v1/plans/search")],
  },
  planCreation: post("/api/v1/plans"),
  clients: {
    anyOf: [get("/api/v1/account-users"), get("/api/v1/account-users/search")],
  },
  clientProfile: post("/api/v1/account-users/bulk-ids"),
  auditLogs: get("/api/v1/audit-logs/filter"),
  eventCategories: {
    anyOf: [
      get("/api/v1/event-categories"),
      get("/api/v1/event-categories/search"),
    ],
  },
  paymentHistory: get("/api/v1/plan-payment-histories"),
  adminUsers: {
    anyOf: [get("/api/v1/admin-users"), get("/api/v1/admin-users/search")],
  },
  adminUserProfile: {
    anyOf: [
      get("/api/v1/admin-users/{id}"),
      post("/api/v1/admin-users/bulk-ids"),
    ],
  },
  promoCodes: {
    anyOf: [get("/api/v1/promo-codes"), get("/api/v1/promo-codes/search")],
  },
  promoCodeLogs: {
    anyOf: [
      get("/api/v1/promo-codes/logs"),
      get("/api/v1/promo-codes/logs/search"),
    ],
  },
  enquiries: {
    anyOf: [get("/api/v1/enquiries"), get("/api/v1/enquiries/search")],
  },
  enquiryDetails: get("/api/v1/enquiries/{id}"),
  permissions: {
    anyOf: [get("/api/v1/permissions"), get("/api/v1/permissions/search")],
  },
  roles: {
    allOf: [
      get("/api/v1/admin-permissions/{role}/permissions"),
      get("/api/v1/permissions"),
    ],
  },
  suspiciousUsers: {
    anyOf: [
      get("/api/v1/suspicious-users"),
      get("/api/v1/suspicious-users/activities"),
    ],
  },
} satisfies Record<string, PermissionRequirement>;
