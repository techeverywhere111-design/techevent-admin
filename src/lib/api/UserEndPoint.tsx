import { z } from "zod";
import api from "../utils/api";
import { AccountUserSchema, AccountUserListResponseSchema, type AccountUser } from "@/lib/schemas";

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
    { params: { text, pageNo, pageSize } }
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
