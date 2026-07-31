/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GetRolePermissions, AssignPermissions, RemovePermissions } from "@/lib/api/AdminPermissionEndpoint";
import { GetPermissions } from "@/lib/api/PermissionEndpoint";
import { ROLE_OPTIONS, type RoleType, type Permission } from "@/lib/schemas";
import { toast } from "react-toastify";
import { showErrorToast } from "@/lib/utils/toast";
import { Search, X, ChevronRight, ChevronLeft, Shield, ShieldX, Loader2 } from "lucide-react";
import AppLoader from "@/components/ui/AppLoader";
import { isPermissionDeniedError } from "@/lib/utils/api";

const ROLE_LABELS: Record<RoleType, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MANAGER: "Manager",
};

const Roles: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<RoleType>("ADMIN");
  const [availableSearch, setAvailableSearch] = useState("");
  const [assignedSearch, setAssignedSearch] = useState("");
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());
  const [selectedAssigned, setSelectedAssigned] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();

  const { data: allPermissionsData, isLoading: loadingAll, error: errorAll } = useQuery({
    queryKey: ["permissions", "all"],
    queryFn: () => GetPermissions(0, 500),
  });

  // Fetch permissions for selected role
  const { data: rolePermissions, isLoading: loadingRole, error: errorRole } = useQuery({
    queryKey: ["role-permissions", selectedRole],
    queryFn: () => GetRolePermissions(selectedRole),
    enabled: !!selectedRole,
  });

  const allPermissions = allPermissionsData?.content || [];
  const assignedPermissions = rolePermissions || [];
  const assignedIds = useMemo(
    () => new Set(assignedPermissions.map((p) => p.id)),
    [assignedPermissions]
  );

  const availablePermissions = useMemo(
    () => allPermissions.filter((p) => !p.isGeneral && !assignedIds.has(p.id)),
    [allPermissions, assignedIds]
  );

  const filteredAvailable = useMemo(
    () =>
      availablePermissions.filter(
        (p) =>
          p.name.toLowerCase().includes(availableSearch.toLowerCase()) ||
          p.module.toLowerCase().includes(availableSearch.toLowerCase())
      ),
    [availablePermissions, availableSearch]
  );

  const filteredAssigned = useMemo(
    () =>
      assignedPermissions.filter(
        (p) =>
          p.name.toLowerCase().includes(assignedSearch.toLowerCase()) ||
          p.module.toLowerCase().includes(assignedSearch.toLowerCase())
      ),
    [assignedPermissions, assignedSearch]
  );

  const assignMutation = useMutation({
    mutationFn: (permissionIds: string[]) =>
      AssignPermissions({ role: selectedRole, permissionIds }),
    onSuccess: () => {
      toast.success("Permissions assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["role-permissions", selectedRole] });
      setSelectedAvailable(new Set());
    },
    onError: (err: any) => {
      showErrorToast(err?.response?.data?.message || "Failed to assign permissions");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (permissionIds: string[]) =>
      RemovePermissions({ role: selectedRole, permissionIds }),
    onSuccess: () => {
      toast.success("Permissions removed successfully");
      queryClient.invalidateQueries({ queryKey: ["role-permissions", selectedRole] });
      setSelectedAssigned(new Set());
    },
    onError: (err: any) => {
      showErrorToast(err?.response?.data?.message || "Failed to remove permissions");
    },
  });

  const handleAssign = () => {
    if (selectedAvailable.size === 0) return;
    assignMutation.mutate(Array.from(selectedAvailable));
  };

  const handleRemove = () => {
    if (selectedAssigned.size === 0) return;
    removeMutation.mutate(Array.from(selectedAssigned));
  };

  const toggleAvailable = (id: string) => {
    setSelectedAvailable((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAssigned = (id: string) => {
    setSelectedAssigned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllAvailable = () => {
    if (selectedAvailable.size === filteredAvailable.length) {
      setSelectedAvailable(new Set());
    } else {
      setSelectedAvailable(new Set(filteredAvailable.map((p) => p.id)));
    }
  };

  const selectAllAssigned = () => {
    if (selectedAssigned.size === filteredAssigned.length) {
      setSelectedAssigned(new Set());
    } else {
      setSelectedAssigned(new Set(filteredAssigned.map((p) => p.id)));
    }
  };

  const handleRoleChange = (role: RoleType) => {
    setSelectedRole(role);
    setSelectedAvailable(new Set());
    setSelectedAssigned(new Set());
    setAvailableSearch("");
    setAssignedSearch("");
  };

  const isLoading = loadingAll || loadingRole;
  const isMutating = assignMutation.isPending || removeMutation.isPending;

  const renderPermissionItem = (
    permission: Permission,
    isSelected: boolean,
    onToggle: (id: string) => void
  ) => (
    <label
      key={permission.id}
      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors rounded-lg ${isSelected
        ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700"
        : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent"
        }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(permission.id)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {permission.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {permission.module}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {permission.method}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {permission.endpoint}
        </p>
      </div>
    </label>
  );

  return (
    <div className="min-h-full w-full min-w-0 bg-gray-50 p-4 dark:bg-gray-900 sm:p-5">
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Role Permissions
          </h1>
        </div>

        {/* Role Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {ROLE_OPTIONS.filter((r) => r !== "SUPER_ADMIN").map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${selectedRole === role
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              {ROLE_LABELS[role]}
            </button>
          ))}
        </div>

        {isPermissionDeniedError(errorAll || errorRole) ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-16 text-center border border-dashed border-red-300 dark:border-red-900/40 flex flex-col items-center justify-center">
            <ShieldX size={48} className="text-red-500 mb-3" />
            <h2 className="text-lg font-semibold text-red-500 mb-1">
              Access Denied
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
              This user is not authorized to view or manage role permissions.
            </p>
          </div>
        ) : selectedRole === "SUPER_ADMIN" ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <Shield size={48} className="mx-auto text-blue-500 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Super Admin
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Super Admin has full access to all features. No permission management needed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4">
            {/* Available Permissions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col min-h-[500px]">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Available ({availablePermissions.length})
                  </h3>
                  <button
                    onClick={selectAllAvailable}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedAvailable.size === filteredAvailable.length && filteredAvailable.length > 0
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search available..."
                    value={availableSearch}
                    onChange={(e) => setAvailableSearch(e.target.value)}
                    className="w-full px-3 py-1.5 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  {availableSearch ? (
                    <button
                      onClick={() => setAvailableSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  ) : (
                    <Search
                      size={14}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <AppLoader fullScreen={false} />
                  </div>
                ) : filteredAvailable.length === 0 ? (
                  <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                    {availableSearch ? "No matching permissions" : "All permissions assigned"}
                  </p>
                ) : (
                  filteredAvailable.map((p) =>
                    renderPermissionItem(p, selectedAvailable.has(p.id), toggleAvailable)
                  )
                )}
              </div>
            </div>

            {/* Transfer Buttons */}
            <div className="flex lg:flex-col items-center justify-center gap-3 py-4 lg:sticky lg:top-1/2 lg:-translate-y-1/2 lg:self-start">
              <button
                onClick={handleAssign}
                disabled={selectedAvailable.size === 0 || isMutating}
                className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                title="Assign selected"
              >
                {assignMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>
              <button
                onClick={handleRemove}
                disabled={selectedAssigned.size === 0 || isMutating}
                className="p-3 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                title="Remove selected"
              >
                {removeMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ChevronLeft size={18} />
                )}
              </button>
            </div>

            {/* Assigned Permissions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col min-h-[500px]">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Assigned to {ROLE_LABELS[selectedRole]} ({assignedPermissions.length})
                  </h3>
                  <button
                    onClick={selectAllAssigned}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedAssigned.size === filteredAssigned.length && filteredAssigned.length > 0
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search assigned..."
                    value={assignedSearch}
                    onChange={(e) => setAssignedSearch(e.target.value)}
                    className="w-full px-3 py-1.5 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  {assignedSearch ? (
                    <button
                      onClick={() => setAssignedSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  ) : (
                    <Search
                      size={14}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <AppLoader fullScreen={false} />
                  </div>
                ) : filteredAssigned.length === 0 ? (
                  <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                    {assignedSearch ? "No matching permissions" : "No permissions assigned"}
                  </p>
                ) : (
                  filteredAssigned.map((p) =>
                    renderPermissionItem(p, selectedAssigned.has(p.id), toggleAssigned)
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Roles;
