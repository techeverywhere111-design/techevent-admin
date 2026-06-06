import api from "../utils/api";
import {
  PermissionSchema,
  PermissionListResponseSchema,
  type Permission,
  type PermissionPayload,
} from "@/lib/schemas";

export const GetPermissions = async (pageNo: number, pageSize: number) => {
  const { data } = await api.get("/api/v1/permissions", {
    params: { pageNo, pageSize },
  });
  return PermissionListResponseSchema.parse(data);
};

export const SearchPermissions = async (
  text: string,
  pageNo: number,
  pageSize: number
) => {
  const { data } = await api.get("/api/v1/permissions/search", {
    params: { text, pageNo, pageSize },
  });
  return PermissionListResponseSchema.parse(data);
};


export const UpdatePermission = async (
  id: string,
  payload: PermissionPayload
): Promise<Permission> => {
  const { data } = await api.put(`/api/v1/permissions/${id}`, payload);
  return PermissionSchema.parse(data);
};

export const GetBulkPermissions = async (
  ids: string[]
): Promise<Permission[]> => {
  const { data } = await api.post("/api/v1/permissions/bulk-ids", ids);
  return PermissionSchema.array().parse(data);
};
