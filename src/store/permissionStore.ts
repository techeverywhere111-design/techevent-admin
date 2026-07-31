import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Permission } from "@/lib/schemas";
import {
  hasPermissionRequirement,
  type PermissionRequirement,
} from "@/lib/permissions";

interface PermissionState {
  permissions: Permission[];
  isLoaded: boolean;
  setPermissions: (permissions: Permission[]) => void;
  clearPermissions: () => void;
}

export const usePermissionStore = create<PermissionState>()(
  immer((set) => ({
    permissions: [],
    isLoaded: true,
    setPermissions: (permissions) =>
      set((s) => {
        s.permissions = permissions;
        s.isLoaded = true;
      }),
    clearPermissions: () =>
      set((s) => {
        s.permissions = [];
        s.isLoaded = false;
      }),
  }))
);

export const useHasPermission = (
  permissionRequirement: PermissionRequirement
): boolean => {
  return usePermissionStore((s) =>
    hasPermissionRequirement(s.permissions, permissionRequirement)
  );
};

export const useHasAnyPermission = (
  permissionRequirements: PermissionRequirement[]
): boolean => {
  return usePermissionStore((s) =>
    permissionRequirements.some((permissionRequirement) =>
      hasPermissionRequirement(s.permissions, permissionRequirement)
    )
  );
};

export const usePermissionsLoaded = (): boolean => {
  return usePermissionStore((s) => s.isLoaded);
};
