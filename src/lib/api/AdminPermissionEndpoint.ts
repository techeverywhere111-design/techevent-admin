import api from "../utils/api";
import {
  PermissionSchema,
  MessageResponseSchema,
  type Permission,
  type AdminPermissionPayload,
} from "@/lib/schemas";

export const GetRolePermissions = async (
  role: string
): Promise<Permission[]> => {
  const { data } = await api.get(
    `/api/v1/admin-permissions/${role}/permissions`
  );
  return PermissionSchema.array().parse(data);
};

export const AssignPermissions = async (payload: AdminPermissionPayload) => {
  const { data } = await api.post("/api/v1/admin-permissions/assign", payload);
  return MessageResponseSchema.parse(data);
};

export const RemovePermissions = async (payload: AdminPermissionPayload) => {
  const { data } = await api.post("/api/v1/admin-permissions/remove", payload);
  return MessageResponseSchema.parse(data);
};
