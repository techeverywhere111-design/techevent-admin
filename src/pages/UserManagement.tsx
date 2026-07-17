/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table, { type Column } from "@/components/ui/Table";
import { User, Search, Upload, Plus, X, Loader2 } from "lucide-react";
import {
  GetAdminUsers,
  SearchAdminUsers,
  GetBulkAdminUsers,
  AdminUserInvite,
  ReinviteAdminUsers,
  DeletePendingAdminUser,
} from "@/lib/api/AdminEndpoint";
import { ROLE_OPTIONS } from "@/lib/schemas";
import { toast } from "react-toastify";
import { showErrorToast } from "@/lib/utils/toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface AdminTableUser {
  id: string;
  name: string;
  email: string;
  roleType: string;
  isPendingUser: boolean;
  dateJoined: string;
  avatar?: string | null;
}

interface InviteFormState {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

type PendingAdminAction = {
  type: "reinvite" | "delete";
  user: AdminTableUser;
} | null;

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || fallback;

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteFormState>({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });
  const [inviteErrors, setInviteErrors] = useState<Partial<InviteFormState>>({});
  const [pendingAdminAction, setPendingAdminAction] =
    useState<PendingAdminAction>(null);

  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery({
    queryKey: ["adminUsers", activeSearchTerm, page, itemsPerPage],
    queryFn: async () => {
      const response = activeSearchTerm
        ? await SearchAdminUsers(activeSearchTerm, page - 1, itemsPerPage)
        : await GetAdminUsers(page - 1, itemsPerPage);

      const mappedUsers: AdminTableUser[] = response.content.map((c: any) => {
        const displayName =
          [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email;
        return {
          id: c.id,
          name: displayName,
          email: c.email,
          roleType: c.roleType,
          isPendingUser: c.isPendingUser,
          dateJoined: c.createdOn,
          avatar: null,
        };
      });

      return { users: mappedUsers, totalElements: response.totalElements };
    },
  });

  const users = data?.users || [];
  const totalCount = data?.totalElements || 0;

  const inviteMutation = useMutation({
    mutationFn: AdminUserInvite,
  });

  const reinviteMutation = useMutation({
    mutationFn: ReinviteAdminUsers,
  });

  const deletePendingMutation = useMutation({
    mutationFn: DeletePendingAdminUser,
  });

  const inviteLoading = inviteMutation.isPending;
  const pendingActionLoading =
    reinviteMutation.isPending || deletePendingMutation.isPending;

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setPage(1);
  };

  const handleClear = () => {
    setSearchTerm("");
    setActiveSearchTerm("");
    setPage(1);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-yellow-400",
      "bg-blue-400",
      "bg-green-400",
      "bg-purple-400",
      "bg-pink-400",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleViewProfile = async (user: AdminTableUser) => {
    try {
      const [adminUser] = await GetBulkAdminUsers([user.id]);
      navigate(`/user-profile?${user.id}`, { state: { user: adminUser } });
    } catch (error) {
      navigate(`/user-profile?${user.id}`);
    }
  };

  const columns: Column[] = [
    {
      key: "name",
      label: "Name",
      render: (value, _row: AdminTableUser) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full ${getAvatarColor(
              value
            )} flex items-center justify-center`}
          >
            <User size={18} className="text-white" />
          </div>
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300">{v}</span>
      ),
    },
    {
      key: "roleType",
      label: "Role",
      render: (v) => (
        <span className="text-gray-900 dark:text-gray-100">{v}</span>
      ),
    },
    {
      key: "isPendingUser",
      label: "Status",
      render: (v) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            v
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
          }`}
        >
          {v ? "Invite Pending" : "Active"}
        </span>
      ),
    },
  ];

  const openPendingActionModal = (
    type: NonNullable<PendingAdminAction>["type"],
    user: AdminTableUser
  ) => {
    setPendingAdminAction({ type, user });
  };

  const closePendingActionModal = () => {
    if (pendingActionLoading) return;
    setPendingAdminAction(null);
  };

  const handleConfirmPendingAction = async () => {
    if (!pendingAdminAction) return;

    const { type, user } = pendingAdminAction;
    try {
      if (type === "reinvite") {
        const response = await reinviteMutation.mutateAsync([user.id]);
        toast.success(response.message || "Invite sent again.");
      } else {
        const response = await deletePendingMutation.mutateAsync(user.id);
        toast.success(response.message || "Pending admin deleted.");
      }

      await queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setPendingAdminAction(null);
    } catch (error: any) {
      showErrorToast(
        getErrorMessage(
          error,
          type === "reinvite"
            ? "Failed to re-invite admin user."
            : "Failed to delete pending admin."
        )
      );
    }
  };

  const renderActions = (row: AdminTableUser) => {
    if (row.isPendingUser) {
      return (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              openPendingActionModal("reinvite", row);
            }}
            disabled={pendingActionLoading}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Re-invite
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              openPendingActionModal("delete", row);
            }}
            disabled={pendingActionLoading}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Pending
          </button>
        </>
      );
    }

    return (
      <>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleViewProfile(row);
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          View Profile
        </button>
      </>
    );
  };

  const handleExport = () => {
    if (users.length === 0) return;

    const exportData = users.map((c) => ({
      Name: c.name,
      Email: c.email,
      "Role Type": c.roleType,
      Status: c.isPendingUser ? "Invite Pending" : "Active",
      "Date Joined": new Date(c.dateJoined).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Admin Users");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "Admin_Users_Management.xlsx");
  };

  const openInviteModal = () => {
    setInviteErrors({});
    setInviteForm({
      firstName: "",
      lastName: "",
      email: "",
      role: "",
    });
    setShowInviteModal(true);
  };

  const closeInviteModal = () => {
    if (inviteLoading) return;
    setShowInviteModal(false);
  };

  const handleInviteChange = (field: keyof InviteFormState, value: string) => {
    setInviteForm((prev) => ({ ...prev, [field]: value }));
    setInviteErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateInviteForm = () => {
    const errors: Partial<InviteFormState> = {};
    if (!inviteForm.firstName.trim())
      errors.firstName = "First name is required";
    if (!inviteForm.lastName.trim()) errors.lastName = "Last name is required";
    if (!inviteForm.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email))
      errors.email = "Invalid email format";
    if (!inviteForm.role.trim()) errors.role = "Role is required";
    return errors;
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateInviteForm();
    if (Object.keys(errors).length > 0) {
      setInviteErrors(errors);
      return;
    }

    try {
      const invitedUser = await inviteMutation.mutateAsync({
        firstName: inviteForm.firstName.trim(),
        lastName: inviteForm.lastName.trim(),
        email: inviteForm.email.trim().toLowerCase(),
        role: inviteForm.role,
      });
      toast.success(`Invite sent to ${invitedUser.email}.`);
      await queryClient.invalidateQueries({ queryKey: ["adminUsers"] });

      setInviteForm({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
      });
      setShowInviteModal(false);
    } catch (error: any) {
      showErrorToast(getErrorMessage(error, "Failed to send invite."));
    }
  };

  const pendingActionIsDelete = pendingAdminAction?.type === "delete";
  const pendingActionTitle = pendingActionIsDelete
    ? "Delete Pending Invite?"
    : "Re-invite Admin?";
  const pendingActionDescription = pendingActionIsDelete
    ? `This will remove the pending invite for ${pendingAdminAction?.user.email}. They will no longer be able to complete this invitation.`
    : `This will send a fresh invitation email to ${pendingAdminAction?.user.email}. Use this if the previous invitation expired.`;
  const pendingActionButtonText = pendingActionLoading
    ? pendingActionIsDelete
      ? "Deleting..."
      : "Sending..."
    : pendingActionIsDelete
      ? "Delete Pending"
      : "Re-invite";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-5 md:w-full sm:w-auto w-[95vw]">
      <div className="md:w-full sm:w-auto w-[60vw]">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            User Management
          </h1>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex gap-2 flex-1 sm:flex-initial">
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="px-4 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              {searchTerm && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Search size={20} />
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={openInviteModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} />
              Send Invite
            </button>
            <button
              onClick={handleExport}
              disabled={users.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-white rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={18} />
              Export
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={users}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setPage(p)}
          onPerPageChange={(newPerPage) => {
            setItemsPerPage(newPerPage);
            setPage(1);
          }}
          renderActions={renderActions}
          loading={loading}
        />
      </div>

      {/* PENDING ADMIN ACTION CONFIRMATION MODAL */}
      {pendingAdminAction && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closePendingActionModal();
            }
          }}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closePendingActionModal}
          />

          <div
            className="relative w-full max-w-md rounded-lg overflow-hidden shadow-xl bg-white dark:bg-gray-800 z-[10001]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 bg-[#081A30] dark:bg-[#081A30]">
              <h3 className="text-white font-semibold text-lg">
                {pendingActionTitle}
              </h3>
              <button
                className="text-white hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={closePendingActionModal}
                disabled={pendingActionLoading}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-6">
                {pendingActionDescription}
              </p>

              <div className="mt-6 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {pendingAdminAction.user.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 break-all">
                  {pendingAdminAction.user.email}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={closePendingActionModal}
                  disabled={pendingActionLoading}
                  className="px-5 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPendingAction}
                  disabled={pendingActionLoading}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-white transition disabled:opacity-70 disabled:cursor-not-allowed ${
                    pendingActionIsDelete
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {pendingActionLoading && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {pendingActionButtonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEND INVITE MODAL */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeInviteModal();
            }
          }}
        >
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeInviteModal}
          />

          {/* modal card */}
          <div
            className="relative w-full max-w-2xl h-[87vh] md:h-[60vh] mx-4 rounded-lg overflow-hidden shadow-xl bg-white dark:bg-gray-800 z-[10001]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#081A30] dark:bg-[#081A30]">
              <h3 className="text-white font-semibold text-lg">Send Invite</h3>
              <button
                className="text-white hover:text-gray-200"
                onClick={closeInviteModal}
                disabled={inviteLoading}
              >
                <X size={20} />
              </button>
            </div>

            {/* body */}
            <form onSubmit={handleInviteSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={inviteForm.firstName}
                    onChange={(e) =>
                      handleInviteChange("firstName", e.target.value)
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                      inviteErrors.firstName
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                    }`}
                  />
                  {inviteErrors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {inviteErrors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={inviteForm.lastName}
                    onChange={(e) =>
                      handleInviteChange("lastName", e.target.value)
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                      inviteErrors.lastName
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                    }`}
                  />
                  {inviteErrors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {inviteErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={inviteForm.email}
                    onChange={(e) =>
                      handleInviteChange("email", e.target.value)
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                      inviteErrors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                    }`}
                  />
                  {inviteErrors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {inviteErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`relative w-full ${
                      inviteErrors.role ? "border-red-500" : ""
                    }`}
                  >
                    <select
                      value={inviteForm.role}
                      onChange={(e) =>
                        handleInviteChange("role", e.target.value)
                      }
                      className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${
                        inviteErrors.role
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                      }`}
                    >
                      <option value="">Select</option>
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  {inviteErrors.role && (
                    <p className="text-red-500 text-sm mt-1">
                      {inviteErrors.role}
                    </p>
                  )}
                </div>
              </div>

              {/* footer */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeInviteModal}
                  disabled={inviteLoading}
                  className="px-5 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {inviteLoading ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
