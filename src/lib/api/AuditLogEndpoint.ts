import { z } from "zod";
import api from "../utils/api";
import {

  AuditLogListResponseSchema,
  type AuditLog,
  FeatureBreakdownResponseSchema,
  type FeatureBreakdownResponse,
} from "@/lib/schemas";

export type { AuditLog };
export type AuditLogResponse = z.infer<typeof AuditLogListResponseSchema>;

export const GetAccountAuditLogs = async (
  pageNo: number,
  pageSize: number,
  accountId?: string
): Promise<AuditLogResponse> => {
  const { data } = await api.get("/api/v1/audit-logs", {
    params: { pageNo, pageSize, accountId },
  });
  return AuditLogListResponseSchema.parse(data);
};

export const SearchAccountAuditLogs = async (
  text: string,
  pageNo: number,
  pageSize: number,
  accountId?: string
): Promise<AuditLogResponse> => {
  const { data } = await api.get("/api/v1/audit-logs/search", {
    params: { text, pageNo, pageSize, accountId },
  });
  return AuditLogListResponseSchema.parse(data);
};

export const GetCoreFeatureBreakdown = async (
  startTime: string,
  endTime: string
): Promise<FeatureBreakdownResponse> => {
  const { data } = await api.get("/api/v1/audit-logs/breakdown/core", {
    params: { startTime, endTime },
  });
  return FeatureBreakdownResponseSchema.parse(data);
};

export const GetFeatureUsageBreakdown = async (
  startTime: string,
  endTime: string
): Promise<FeatureBreakdownResponse> => {
  const { data } = await api.get("/api/v1/audit-logs/breakdown", {
    params: { startTime, endTime },
  });
  return FeatureBreakdownResponseSchema.parse(data);
};

