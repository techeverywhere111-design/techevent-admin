import { type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePermissionStore } from "@/store/permissionStore";
import {
  hasPermissionRequirement,
  type PermissionRequirement,
} from "@/lib/permissions";

interface CanProps {
  permission: PermissionRequirement;
  children: ReactNode;
  fallback?: ReactNode;
}

export const Can = ({ permission, children, fallback = null }: CanProps) => {
  const { user } = useAuth();
  const hasPermission = usePermissionStore((s) =>
    hasPermissionRequirement(s.permissions, permission)
  );

  if (user?.roleType === "SUPER_ADMIN") return <>{children}</>;
  if (!hasPermission) return <>{fallback}</>;
  return <>{children}</>;
};

export const useCanAccess = (permission: PermissionRequirement): boolean => {
  const { user } = useAuth();
  const hasPermission = usePermissionStore((s) =>
    hasPermissionRequirement(s.permissions, permission)
  );

  if (user?.roleType === "SUPER_ADMIN") return true;
  return hasPermission;
};
