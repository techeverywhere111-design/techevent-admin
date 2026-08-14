import api from "@/lib/utils/api";
import {
  AdminUserSchema,
  AdminUserListResponseSchema,
  MessageResponseSchema,
  type AdminUser,
} from "@/lib/schemas";

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

export interface AdminUserInvitePayload {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface CompleteAdminInvitePayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CompleteResetPasswordPayload {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export const AdminUserLogin = async (
  payload: AdminUserLoginPayload
): Promise<AdminUserLoginResponse> => {
  const { data } = await api.post("/api/v1/admin-users/login", payload);
  return AdminUserSchema.parse(data);
};

export const AdminUserInvite = async (
  payload: AdminUserInvitePayload
): Promise<AdminUserResponse> => {
  const { data } = await api.post("/api/v1/admin-users/invite", payload);
  return AdminUserSchema.parse(data);
};

export const ReinviteAdminUsers = async (adminUserIds: string[]) => {
  const { data } = await api.post(
    "/api/v1/admin-users/reinvite",
    adminUserIds
  );
  return MessageResponseSchema.parse(data);
};

export const CompleteAdminInvite = async (
  payload: CompleteAdminInvitePayload
) => {
  const { data } = await api.put("/api/v1/admin-users/complete-invite", payload);
  return MessageResponseSchema.parse(data);
};

export const InitiateAdminPasswordReset = async (email: string) => {
  const { data } = await api.put(
    "/api/v1/admin-users/initiate-reset-password",
    undefined,
    { params: { email } }
  );
  return MessageResponseSchema.parse(data);
};

export const CompleteAdminPasswordReset = async (
  payload: CompleteResetPasswordPayload
) => {
  const { data } = await api.put(
    "/api/v1/admin-users/complete-reset-password",
    payload
  );
  return MessageResponseSchema.parse(data);
};

export const GetAdmin = async (id: string): Promise<AdminUserResponse> => {
  const { data } = await api.get(`/api/v1/admin-users/${id}`);
  return AdminUserSchema.parse(data);
};

export const DeletePendingAdminUser = async (id: string) => {
  const { data } = await api.delete(`/api/v1/admin-users/${id}`);
  return MessageResponseSchema.parse(data);
};

export const ActivateAdminUser = async (id: string) => {
  const { data } = await api.get(`/api/v1/admin-users/${id}/activate`, {
    headers: { "x-show-error-toast": "true" },
  });
  return MessageResponseSchema.parse(data);
};

export const DeactivateAdminUser = async (id: string) => {
  const { data } = await api.get(`/api/v1/admin-users/${id}/deactivate`, {
    headers: { "x-show-error-toast": "true" },
  });
  return MessageResponseSchema.parse(data);
};

export const SearchAdminUsers = async (
  text: string,
  pageNo: number,
  pageSize: number
) => {
  const { data } = await api.get("/api/v1/admin-users/search", {
    params: { text, pageNo, pageSize },
    headers: { "x-show-error-toast": "true" },
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

export interface UpdateSelfAdminUserPayload {
  firstName: string;
  lastName: string;
}

export const UpdateSelfAdminUser = async (
  payload: UpdateSelfAdminUserPayload
): Promise<AdminUserResponse> => {
  const { data } = await api.put("/api/v1/admin-users", payload, {
    headers: { "x-show-error-toast": "true" },
  });
  return AdminUserSchema.parse(data);
};

export interface ChangeAdminPasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangeAdminPassword = async (
  payload: ChangeAdminPasswordPayload
) => {
  const { data } = await api.post(
    "/api/v1/admin-users/change-password",
    payload,
    { headers: { "x-show-error-toast": "true" } }
  );
  return MessageResponseSchema.parse(data);
};
