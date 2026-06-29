import { type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePermissionStore } from "@/store/permissionStore";
import { ShieldX } from "lucide-react";

import AppLoader from "@/components/ui/AppLoader";

interface PermissionGuardProps {
  requires: string;
  children: ReactNode;
}

export const PermissionGuard = ({ requires, children }: PermissionGuardProps) => {
  const { user } = useAuth();
  const hasPermission = usePermissionStore((s) =>
    s.permissions.some((p) => p.name === requires)
  );
  const isLoaded = usePermissionStore((s) => s.isLoaded);

  if (user?.roleType === "SUPER_ADMIN") return <>{children}</>;

  if (!isLoaded) {
    return <AppLoader fullScreen={false} />;
  }

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full mb-6">
          <ShieldX size={48} className="text-red-500 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          You don't have permission to access this page. Contact your administrator
          if you believe this is a mistake.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
