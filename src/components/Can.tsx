import { type ReactNode } from "react";
import { type PermissionRequirement } from "@/lib/permissions";

interface CanProps {
  permission: PermissionRequirement;
  children: ReactNode;
  fallback?: ReactNode;
}

export const Can = ({ children }: CanProps) => {
  return <>{children}</>;
};

export const useCanAccess = (_permission: PermissionRequirement): boolean => {
  return true;
};
