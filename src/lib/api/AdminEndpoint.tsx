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

export const SearchAdminUsers = async (
  text: string,
  pageNo: number,
  pageSize: number
) => {
  const { data } = await api.get<AdminUserResponse>(
    "/api/v1/admin-users/search",
    { params: { text, pageNo, pageSize } }
  );
  return data;
};

export const GetAdminUsers = async (pageNo: number, pageSize: number) => {
  const { data } = await api.get("/api/v1/admin-users", {
    params: { pageNo, pageSize },
  });
  return data;
};

export const GetBulkAdminUsers = async (
  ids: string[]
): Promise<AdminUserResponse[]> => {
  const { data } = await api.post<AdminUserResponse[]>(
    "/api/v1/admin-users/bulk-ids",
    ids
  );
  return data;
};

export const UpdateAdminUser = async (
  userId: string,
  payload: {
    firstName: string;
    lastName: string;
    email: string;
  }
): Promise<AdminUserResponse> => {
  const { data } = await api.put<AdminUserResponse>(
    `/api/v1/admin-users/${userId}`,
    payload
  );
  return data;
};
