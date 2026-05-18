import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { usePermissionStore } from "@/store/permissionStore";
import { GetRolePermissions } from "@/lib/api/AdminPermissionEndpoint";

export const useHydratePermissions = () => {
  const { user } = useAuth();
  const setPermissions = usePermissionStore((s) => s.setPermissions);
  const isLoaded = usePermissionStore((s) => s.isLoaded);

  const { data, isSuccess } = useQuery({
    queryKey: ["role-permissions", user?.roleType],
    queryFn: () => GetRolePermissions(user!.roleType),
    enabled: !!user?.roleType,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isSuccess && data) {
      setPermissions(data);
    }
  }, [isSuccess, data, setPermissions]);

  return { isLoaded: isLoaded || user?.roleType === "SUPER_ADMIN" };
};
