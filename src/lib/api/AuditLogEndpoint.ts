import { z } from "zod";
import api from "../utils/api";
import {

  AuditLogListResponseSchema,
  type AuditLog
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




