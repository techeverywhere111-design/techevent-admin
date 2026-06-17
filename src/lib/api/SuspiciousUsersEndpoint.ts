import api from "../utils/api";
import {
  SuspiciousUserListResponseSchema,
  SuspiciousActivityListResponseSchema,
  type SuspiciousUserListResponse,
  type SuspiciousActivityListResponse
} from "@/lib/schemas";

export const GetSuspiciousUsers = async (
  pageNo: number,
  pageSize: number
): Promise<SuspiciousUserListResponse> => {
  const { data } = await api.get("/api/v1/suspicious-users", {
    params: { pageNo, pageSize },
  });
  return SuspiciousUserListResponseSchema.parse(data);
};

export const GetSuspiciousActivities = async (
  pageNo: number,
  pageSize: number
): Promise<SuspiciousActivityListResponse> => {
  const { data } = await api.get("/api/v1/suspicious-users/activities", {
    params: { pageNo, pageSize },
  });
  return SuspiciousActivityListResponseSchema.parse(data);
};
