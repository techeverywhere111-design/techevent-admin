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

export interface FilterAuditLogsParams {
  startTime: string;
  endTime: string;
  pageNo: number;
  pageSize: number;
  module?: string;
}

export const FilterAuditLogs = async ({
  startTime,
  endTime,
  pageNo,
  pageSize,
  module,
}: FilterAuditLogsParams): Promise<AuditLogResponse> => {
  const params: Record<string, string | number> = {
    startTime,
    endTime,
    pageNo,
    pageSize,
  };
  if (module) params.module = module;

  const { data } = await api.get("/api/v1/audit-logs/filter", { params });
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
