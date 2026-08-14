import { z } from "zod";

// Admin Role Types
export const RoleTypeEnum = z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
export type RoleType = z.infer<typeof RoleTypeEnum>;
export const ROLE_OPTIONS = RoleTypeEnum.options;

// Base User Schema
export const AdminUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  isPendingUser: z.boolean(),
  isActive: z.boolean().nullable().optional(),
  roleType: RoleTypeEnum,
  lastLogin: z.string().nullable().optional(),
  createdOn: z.string(),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

// Account User Schema (Clients/Management)
export const AccountUserSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  imageId: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  createdOn: z.string(),
  lastLogin: z.string().nullable().optional(),
  isActive: z.boolean().nullable().optional(),
});

export type AccountUser = z.infer<typeof AccountUserSchema>;

// Pagination Meta Schema
export const PaginationSchema = z.object({
  totalPages: z.number().nullish(),
  size: z.number().nullish(),
  totalElements: z.number().nullish(),
  hasNext: z.boolean().nullish(),
  hasPrevious: z.boolean().nullish(),
});

// Paginated Responses
export const AdminUserListResponseSchema = PaginationSchema.extend({
  content: z.array(AdminUserSchema),
});

export const AccountUserListResponseSchema = PaginationSchema.extend({
  content: z.array(AccountUserSchema),
});

// Plan Schemas
export const FeatureSchema = z.record(z.string(), z.any()).nullish();

export const PlanSchema = z.object({
  id: z.string(),
  type: z.string().nullish(),
  name: z.string().nullish(),
  features: z.record(z.string(), FeatureSchema).nullish(),
  priceNaira: z.number().nullish(),
  priceUsd: z.number().nullish(),
  isActive: z.boolean().nullish(),
  createdOn: z.string().nullish(),
  createdAt: z.string().nullish(),
});

export type Plan = z.infer<typeof PlanSchema>;

export const PlanListResponseSchema = PaginationSchema.extend({
  content: z.array(PlanSchema),
});

export type PlanListResponse = z.infer<typeof PlanListResponseSchema>;

// Plan Payment History Schemas
export const PlanPaymentHistorySchema = z.object({
  id: z.string(),
  accountId: z.string().nullish(),
  planId: z.string().nullish(),
  planResponse: PlanSchema.nullish(),
  planAmount: z.number().nullish(),
  paidAmount: z.number().nullish(),
  currency: z.string().nullish(),
  channel: z.string().nullish(),
  email: z.string().nullish(),
  createdBy: z.string().nullish(),
  accountOwnerResponse: AccountUserSchema.nullish(),
  createdOn: z.string().nullish(),
});

export type PlanPaymentHistory = z.infer<typeof PlanPaymentHistorySchema>;

export const PlanPaymentHistoryListResponseSchema = PaginationSchema.extend({
  content: z.array(PlanPaymentHistorySchema),
});

export type PlanPaymentHistoryListResponse = z.infer<typeof PlanPaymentHistoryListResponseSchema>;

// Promo Code Schemas
export const PromoCodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  owner: z.string(),
  discountPercentage: z.number(),
  settlementPercentage: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  createdOn: z.string(),
  createdBy: AdminUserSchema,
});

export type PromoCode = z.infer<typeof PromoCodeSchema>;

export const PromoCodeListResponseSchema = PaginationSchema.extend({
  content: z.array(PromoCodeSchema),
});

// Promo Registration Log Schema
export const PromoRegistrationLogSchema = z.object({
  id: z.string(),
  promoCode: z.string(),
  userEmail: z.string().email(),
  userPaidAmount: z.number(),
  planAmount: z.number(),
  hasSettled: z.boolean(),
  settledDate: z.string().nullable().optional(),
  createdOn: z.string(),
  lastModifiedByUser: AdminUserSchema.nullable().optional(),
});

export type PromoRegistrationLog = z.infer<typeof PromoRegistrationLogSchema>;

export const PromoRegistrationLogListResponseSchema = PaginationSchema.extend({
  content: z.array(PromoRegistrationLogSchema),
});

// Event Category Schemas
export const EventCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  createdOn: z.string(),
});

export type EventCategory = z.infer<typeof EventCategorySchema>;

export const EventCategoryListResponseSchema = PaginationSchema.extend({
  content: z.array(EventCategorySchema),
});

// Audit Log Schemas
export const AuditLogSchema = z.object({
  id: z.string(),
  accountUser: AccountUserSchema.extend({
    isActive: z.boolean().optional(),
  }).nullable().optional(),
  accountId: z.string(),
  userAgent: z.string().nullable().optional(),
  actionPerformed: z.string(),
  actionPerformedSummary: z.string().nullable().optional(),
  module: z.string(),
  location: z.string().nullable().optional(),
  isSuccessful: z.boolean(),
  errorMessage: z.string().nullable().optional(),
  createdOn: z.string(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

export const AuditLogListResponseSchema = PaginationSchema.extend({
  content: z.array(AuditLogSchema),
});

// Enquiry Schemas
export const EnquirySchema = z.object({
  id: z.string(),
  name: z.string(),
  businessName: z.string().nullable().optional(),
  email: z.string(),
  subject: z.string().nullable().optional(),
  message: z.string(),
  isTreated: z.boolean(),
  treatedBy: z.string().nullable().optional(),
  treatedByUser: AdminUserSchema.nullable().optional(),
  createdOn: z.string(),
  enquiryCategory: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
});

export type Enquiry = z.infer<typeof EnquirySchema>;

export const EnquiryListResponseSchema = PaginationSchema.extend({
  content: z.array(EnquirySchema),
});

export const TopEnquiryCategorySchema = z.object({
  enquiryCategory: z.string().nullable(),
  count: z.number(),
});

export type TopEnquiryCategory = z.infer<typeof TopEnquiryCategorySchema>;

// Permission Schemas
export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  module: z.string(),
  description: z.string(),
  endpoint: z.string(),
  method: z.string(),
  planFeature: z.string(),
  isGeneral: z.boolean(),
  createdOn: z.string(),
});

export type Permission = z.infer<typeof PermissionSchema>;

export const PermissionListResponseSchema = PaginationSchema.extend({
  content: z.array(PermissionSchema),
});

export const PermissionPayloadSchema = z.object({
  name: z.string(),
  description: z.string(),
  module: z.string(),
  endpoint: z.string(),
  method: z.string(),
  planFeature: z.string(),
  isGeneral: z.boolean(),
});

export type PermissionPayload = z.infer<typeof PermissionPayloadSchema>;

// Admin Permission Schemas (role-permission mapping)
export const AdminPermissionPayloadSchema = z.object({
  role: RoleTypeEnum,
  permissionIds: z.array(z.string()),
});

export type AdminPermissionPayload = z.infer<typeof AdminPermissionPayloadSchema>;

// Meeting Daily Creation Schema
export const MeetingDailyCreationColumnSchema = z.object({
  day: z.number(),
  totalCount: z.number(),
});

export const MeetingDailyCreationResponseSchema = z.object({
  columns: z.array(MeetingDailyCreationColumnSchema),
});

export type MeetingDailyCreationResponse = z.infer<typeof MeetingDailyCreationResponseSchema>;

export const MessageResponseSchema = z.object({
  message: z.string(),
});

export const TotalCountResponseSchema = z.object({
  totalCount: z.number(),
});

export type TotalCountResponse = z.infer<typeof TotalCountResponseSchema>;

export const FeatureBreakdownColumnSchema = z.object({
  feature: z.string(),
  totalCount: z.number().optional().default(0),
  totalAmount: z.number().optional().default(0),
  currency: z.string().optional(),
});

export const FeatureBreakdownResponseSchema = z.object({
  columns: z.array(FeatureBreakdownColumnSchema),
});

export type FeatureBreakdownResponse = z.infer<typeof FeatureBreakdownResponseSchema>;

// Suspicious Users & Activities Schemas
export const SuspiciousAccountUserSchema = AccountUserSchema.extend({
  isActive: z.boolean().nullable().optional(),
});

export type SuspiciousAccountUser = z.infer<typeof SuspiciousAccountUserSchema>;

export const SuspiciousUserSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  createdBy: z.string().nullable().optional(),
  accountUserResponse: SuspiciousAccountUserSchema.nullable().optional(),
  userAgent: z.string().nullable().optional(),
  numberOfOccurrences: z.number(),
  isBlocked: z.boolean().nullable().optional(),
  createdOn: z.string(),
  updatedOn: z.string().nullable().optional(),
});

export type SuspiciousUser = z.infer<typeof SuspiciousUserSchema>;

export const SuspiciousUserListResponseSchema = PaginationSchema.extend({
  content: z.array(SuspiciousUserSchema),
});

export type SuspiciousUserListResponse = z.infer<typeof SuspiciousUserListResponseSchema>;

export const SuspiciousActivitySchema = z.object({
  id: z.string(),
  accountId: z.string(),
  createdBy: z.string().nullable().optional(),
  accountUserResponse: SuspiciousAccountUserSchema.nullable().optional(),
  userAgent: z.string().nullable().optional(),
  actionPerformed: z.string(),
  endpoint: z.string(),
  method: z.string(),
  createdOn: z.string(),
});

export type SuspiciousActivity = z.infer<typeof SuspiciousActivitySchema>;

export const SuspiciousActivityListResponseSchema = PaginationSchema.extend({
  content: z.array(SuspiciousActivitySchema),
});

export type SuspiciousActivityListResponse = z.infer<typeof SuspiciousActivityListResponseSchema>;

