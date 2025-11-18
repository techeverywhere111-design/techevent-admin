import api from "@/lib/utils/api";

export interface AdminUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export interface AdminUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isPendingUser: boolean;
  roleType: string;
  lastLogin: string;
  createdOn: string;
}

export interface AdminUserLoginPayload {
  email: string;
  password: string;
}

export interface AdminUserLoginResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isPendingUser: boolean;
  roleType: string;
  lastLogin: string;
  createdOn: string;
}

export const AdminUserLogin = async (
  payload: AdminUserLoginPayload
): Promise<AdminUserLoginResponse> => {
  const { data } = await api.post<AdminUserLoginResponse>(
    "/api/v1/admin-users/login",
    payload
  );
  console.log("Login response data:", data);
  return data;
};

export const AdminUserCreate = async (
  payload: AdminUserPayload
): Promise<AdminUserResponse> => {
  const { data } = await api.post<AdminUserResponse>(
    "/api/v1/admin-users",
    payload
  );
  return data;
};
