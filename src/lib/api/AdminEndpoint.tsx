import api from "@/lib/utils/api";
import { AdminUserSchema, AdminUserListResponseSchema, type AdminUser } from "@/lib/schemas";

export interface AdminUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export type AdminUserResponse = AdminUser;
export type AdminUserLoginResponse = AdminUser;

export interface AdminUserLoginPayload {
  email: string;
  password: string;
}

export const AdminUserLogin = async (
  payload: AdminUserLoginPayload
): Promise<AdminUserLoginResponse> => {
  const { data } = await api.post("/api/v1/admin-users/login", payload);
  return AdminUserSchema.parse(data);
};

export const AdminUserCreate = async (
  payload: AdminUserPayload
): Promise<AdminUserResponse> => {
  const { data } = await api.post("/api/v1/admin-users", payload);
  return AdminUserSchema.parse(data);
};

export const SearchAdminUsers = async (
  text: string,
  pageNo: number,
  pageSize: number
) => {
  const { data } = await api.get("/api/v1/admin-users/search", {
    params: { text, pageNo, pageSize },
  });
  return AdminUserListResponseSchema.parse(data);
};

export const GetAdminUsers = async (pageNo: number, pageSize: number) => {
  const { data } = await api.get("/api/v1/admin-users", {
    params: { pageNo, pageSize },
  });
  return AdminUserListResponseSchema.parse(data);
};

export const GetBulkAdminUsers = async (
  ids: string[]
): Promise<AdminUserResponse[]> => {
  const { data } = await api.post("/api/v1/admin-users/bulk-ids", ids);
  return AdminUserSchema.array().parse(data);
};

export const UpdateAdminUser = async (
  userId: string,
  payload: {
    firstName: string;
    lastName: string;
    email: string;
  }
): Promise<AdminUserResponse> => {
  const { data } = await api.put(`/api/v1/admin-users/${userId}`, payload);
  return AdminUserSchema.parse(data);
};
