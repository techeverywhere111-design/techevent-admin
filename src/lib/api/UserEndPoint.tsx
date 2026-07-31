import { z } from "zod";
import api from "../utils/api";
import {
  AccountUserSchema,
  AccountUserListResponseSchema,
  MessageResponseSchema,
  type AccountUser,
  TotalCountResponseSchema,
  type TotalCountResponse,
  FeatureBreakdownResponseSchema,
  type FeatureBreakdownResponse,
} from "@/lib/schemas";

export type { AccountUser };
export type AccountUsersResponse = z.infer<typeof AccountUserListResponseSchema>;

export const GetAccountUsers = async (
  pageNo: number,
  pageSize: number
): Promise<AccountUsersResponse> => {
  const { data } = await api.get(
    "/api/v1/account-users",
    {
      params: { pageNo, pageSize },
    }
  );
  return AccountUserListResponseSchema.parse(data);
};

export const SearchAccountUsers = async (
  text: string,
  pageNo: number,
  pageSize: number
): Promise<AccountUsersResponse> => {
  const { data } = await api.get(
    "/api/v1/account-users/search",
    {
      params: { text, pageNo, pageSize },
      headers: { "x-show-error-toast": "true" },
    }
  );
  return AccountUserListResponseSchema.parse(data);
};

export const GetBulkAccountUsers = async (
  ids: string[]
): Promise<AccountUser[]> => {
  const { data } = await api.post(
    "/api/v1/account-users/bulk-ids",
    ids
  );
  return AccountUserSchema.array().parse(data);
};

export const ActivateAccountUser = async (id: string) => {
  const { data } = await api.get(`/api/v1/account-users/${id}/activate`, {
    headers: { "x-show-error-toast": "true" },
  });
  return MessageResponseSchema.parse(data);
};

export const DeactivateAccountUser = async (id: string) => {
  const { data } = await api.get(`/api/v1/account-users/${id}/deactivate`, {
    headers: { "x-show-error-toast": "true" },
  });
  return MessageResponseSchema.parse(data);
};

export const GetTotalAccounts = async (): Promise<TotalCountResponse> => {
  const { data } = await api.get("/api/v1/account-users/total-accounts", {
    headers: { "x-skip-error-toast": "true" },
  });
  return TotalCountResponseSchema.parse(data);
};

export const GetTotalAccountUsers = async (): Promise<TotalCountResponse> => {
  const { data } = await api.get("/api/v1/account-users/total-account-users", {
    headers: { "x-skip-error-toast": "true" },
  });
  return TotalCountResponseSchema.parse(data);
};

export const GetTotalCreatedAccounts = async (
  startTime: string,
  endTime: string
): Promise<TotalCountResponse> => {
  const { data } = await api.get("/api/v1/account-users/total-created-accounts", {
    params: { startTime, endTime },
    headers: { "x-skip-error-toast": "true" },
  });
  return TotalCountResponseSchema.parse(data);
};

export const GetFreeVsPaidAccounts = async (): Promise<FeatureBreakdownResponse> => {
  const { data } = await api.get("/api/v1/account-users/free-vs-paid-accounts", {
    headers: { "x-skip-error-toast": "true" },
  });
  return FeatureBreakdownResponseSchema.parse(data);
};

export const GetAccountPlanStatistics = async (): Promise<FeatureBreakdownResponse> => {
  const { data } = await api.get("/api/v1/account-users/account-plan-statistics", {
    headers: { "x-skip-error-toast": "true" },
  });
  return FeatureBreakdownResponseSchema.parse(data);
};

