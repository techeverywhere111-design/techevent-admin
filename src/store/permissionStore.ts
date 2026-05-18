import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Permission } from "@/lib/schemas";

interface PermissionState {
  permissions: Permission[];
  isLoaded: boolean;
  setPermissions: (permissions: Permission[]) => void;
  clearPermissions: () => void;
}

export const usePermissionStore = create<PermissionState>()(
  immer((set) => ({
    permissions: [],
    isLoaded: false,
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

export const useHasPermission = (permissionName: string): boolean => {
  return usePermissionStore((s) =>
    s.permissions.some((p) => p.name === permissionName)
  );
};

export const useHasAnyPermission = (permissionNames: string[]): boolean => {
  return usePermissionStore((s) =>
    permissionNames.some((name) => s.permissions.some((p) => p.name === name))
  );
};

export const usePermissionsLoaded = (): boolean => {
  return usePermissionStore((s) => s.isLoaded);
};
