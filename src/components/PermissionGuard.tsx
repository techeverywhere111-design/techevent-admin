import { type ReactNode } from "react";
import { type PermissionRequirement } from "@/lib/permissions";

interface PermissionGuardProps {
  requires: PermissionRequirement;
  children: ReactNode;
}

export const PermissionGuard = ({ children }: PermissionGuardProps) => {
  return <>{children}</>;
};
