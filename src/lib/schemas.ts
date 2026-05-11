import { z } from "zod";

// Base User Schema
export const AdminUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  isPendingUser: z.boolean(),
  roleType: z.string(),
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
});

export type AccountUser = z.infer<typeof AccountUserSchema>;

// Pagination Meta Schema
export const PaginationSchema = z.object({
  totalPages: z.number(),
  size: z.number(),
  totalElements: z.number(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
});

// Paginated Responses
export const AdminUserListResponseSchema = PaginationSchema.extend({
  content: z.array(AdminUserSchema),
});

export const AccountUserListResponseSchema = PaginationSchema.extend({
  content: z.array(AccountUserSchema),
});

// Plan Schemas
export const FeatureSchema = z.record(z.string(), z.any());

export const PlanSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  features: z.record(z.string(), FeatureSchema),
  priceNaira: z.number(),
  priceUsd: z.number(),
  isActive: z.boolean(),
  createdOn: z.string(),
});

export type Plan = z.infer<typeof PlanSchema>;

// Promo Code Schemas
export const PromoCodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  owner: z.string(),
  discountPercentage: z.number(),
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
  description: z.string(),
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
    isActive: z.boolean(),
  }),
  accountId: z.string(),
  userAgent: z.string(),
  actionPerformed: z.string(),
  actionPerformedSummary: z.string(),
  module: z.string(),
  location: z.string(),
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
  email: z.string().email(),
  subject: z.string(),
  message: z.string(),
  isTreated: z.boolean(),
  treatedBy: z.string().nullable().optional(),
  treatedByUser: AdminUserSchema.nullable().optional(),
  createdOn: z.string(),
});

export type Enquiry = z.infer<typeof EnquirySchema>;

export const EnquiryListResponseSchema = PaginationSchema.extend({
  content: z.array(EnquirySchema),
});
