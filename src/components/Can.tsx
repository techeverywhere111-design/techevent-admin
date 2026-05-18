import { type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePermissionStore } from "@/store/permissionStore";

interface CanProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const Can = ({ permission, children, fallback = null }: CanProps) => {
  const { user } = useAuth();
  const hasPermission = usePermissionStore((s) =>
    s.permissions.some((p) => p.name === permission)
  );

  if (user?.roleType === "SUPER_ADMIN") return <>{children}</>;
  if (!hasPermission) return <>{fallback}</>;
  return <>{children}</>;
};

export const useCanAccess = (permission: string): boolean => {
  const { user } = useAuth();
  const hasPermission = usePermissionStore((s) =>
    s.permissions.some((p) => p.name === permission)
  );

  if (user?.roleType === "SUPER_ADMIN") return true;
  return hasPermission;
};
