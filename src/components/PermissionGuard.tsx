import { type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePermissionStore } from "@/store/permissionStore";
import {
  hasPermissionRequirement,
  type PermissionRequirement,
} from "@/lib/permissions";
import { ShieldX } from "lucide-react";

import AppLoader from "@/components/ui/AppLoader";

interface PermissionGuardProps {
  requires: PermissionRequirement;
  children: ReactNode;
}

export const PermissionGuard = ({ children }: PermissionGuardProps) => {
  return <>{children}</>;
};
