/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table, { type Column } from "@/components/ui/Table";
import { User, Search, Download, X } from "lucide-react";
import {
  ActivateAccountUser,
  DeactivateAccountUser,
  GetAccountUsers,
  SearchAccountUsers,
} from "@/lib/api/UserEndPoint";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { showErrorToast } from "@/lib/utils/toast";
import { formatDateTime } from "@/lib/utils/date";
import { isPermissionDeniedError } from "@/lib/utils/api";

interface Client {
  id: string;
  accountId: string;
  name: string;
  email: string | null | undefined;
  planType: "Personal" | "Business";
  isActive: boolean;
  dateJoined: string;
  avatar: string | null | undefined;
}


const ClientManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pendingStatusAction, setPendingStatusAction] = useState<Client | null>(
    null
  );
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading: loading, error } = useQuery({
    queryKey: ["clients", activeSearchTerm, page, itemsPerPage],
    queryFn: async () => {
      let response;
      if (activeSearchTerm) {
        try {
          response = await SearchAccountUsers(activeSearchTerm, page - 1, itemsPerPage);
        } catch (_err) {
          response = await GetAccountUsers(page - 1, itemsPerPage);
        }
      } else {
        response = await GetAccountUsers(page - 1, itemsPerPage);
      }




      const mappedClients: Client[] = response.content.map((c) => {
        const displayName = c.name?.trim() || `${c.firstName || ""} ${c.lastName || ""}`.trim();

        const planType: "Personal" | "Business" = c.name ? "Business" : "Personal";
        return {
          id: c.id,
          accountId: c.accountId,
          name: displayName,
          email: c.email,
          planType,
          isActive: c.isActive ?? true,
          dateJoined: c.createdOn,
          avatar: c.imageUrl,
        };
      });

      return { clients: mappedClients, totalElements: response.totalElements };
    },
  });

  const clients = data?.clients || [];
  const totalCount = data?.totalElements || 0;

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? DeactivateAccountUser(id) : ActivateAccountUser(id),
    onSuccess: async (response, variables) => {
      toast.success(
        response.message ||
          (variables.isActive
            ? "User deactivated successfully."
            : "User activated successfully.")
      );
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: any) => {
      showErrorToast(
        error.response?.data?.message ||
          "Failed to update user active status."
      );
    },
  });

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

  const handleViewProfile = (client: Client) =>
    navigate(`/client-profile?${client.id}`);
  const handlePaymentHistory = (client: Client) =>
    navigate(`/clients/${client.accountId || client.id}/payments`);

  const handleToggleActive = () => {
    if (!pendingStatusAction) return;
    toggleActiveMutation.mutate({
      id: pendingStatusAction.id,
      isActive: pendingStatusAction.isActive,
    }, {
      onSuccess: () => setPendingStatusAction(null),
    });
  };


  const columns: Column[] = [
    {
      key: "name",
      label: "Name",
      render: (value, _row: Client) => (
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
    { key: "planType", label: "Plan Type" },
    {
      key: "isActive",
      label: "Status",
      render: (v) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            v
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          {v ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "dateJoined",
      label: "Date Joined",
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300">
          {formatDateTime(v)}
        </span>
      ),
    },
  ];

  const renderActions = (row: Client) => {
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

        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handlePaymentHistory(row);
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Payment History
        </button>

        {/* <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setPendingStatusAction(row);
          }}
          disabled={toggleActiveMutation.isPending}
          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed ${
            row.isActive
              ? "text-red-600 dark:text-red-400"
              : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {row.isActive ? "Deactivate" : "Activate"}
        </button> */}
      </>
    );
  };

  const handleExport = () => {
    if (clients.length === 0) return;

    const exportData = clients.map((c) => ({
      Name: c.name,
      Email: c.email,
      "Plan Type": c.planType,
      Status: c.isActive ? "Active" : "Inactive",
      "Date Joined": formatDateTime(c.dateJoined),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "Clients_Management.xlsx");
  };

  return (
    <div className="min-h-full w-full min-w-0 bg-gray-50 p-4 transition-colors duration-300 dark:bg-gray-900 sm:p-5">
      <div className="w-full min-w-0">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Clients Management
          </h1>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex w-full min-w-0 gap-2 sm:w-auto sm:flex-1">
            <div className="relative min-w-0 flex-1 sm:max-w-64">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full min-w-0 rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex-shrink-0 flex items-center justify-center"
            >
              <Search size={20} />
            </button>
          </div>

          <button
            onClick={handleExport}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-blue-600 transition hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 sm:w-auto"
          >
            <Download size={18} />
            Export
          </button>
        </div>

        <Table
          columns={columns}
          data={clients}
          totalCount={totalCount}
          itemsPerPage={10}
          onPageChange={(p) => setPage(p)}
          onPerPageChange={(newPerPage) => {
            setItemsPerPage(newPerPage);
            setPage(1);
          }}
          renderActions={renderActions}
          loading={loading}
          isUnauthorized={isPermissionDeniedError(error)}
        />
      </div>

      {pendingStatusAction && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !toggleActiveMutation.isPending) {
              setPendingStatusAction(null);
            }
          }}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => {
              if (!toggleActiveMutation.isPending) setPendingStatusAction(null);
            }}
          />

          <div
            className="relative w-full max-w-md rounded-lg overflow-hidden shadow-xl bg-white dark:bg-gray-800 z-[10001]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 bg-[#081A30] dark:bg-[#081A30]">
              <h3 className="text-white font-semibold text-lg">
                {pendingStatusAction.isActive ? "Deactivate User?" : "Activate User?"}
              </h3>
              <button
                className="text-white hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setPendingStatusAction(null)}
                disabled={toggleActiveMutation.isPending}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-6">
                {pendingStatusAction.isActive
                  ? `This will deactivate ${pendingStatusAction.email}. They will not be able to access their account until reactivated.`
                  : `This will reactivate ${pendingStatusAction.email} and restore their account access.`}
              </p>

              <div className="mt-6 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {pendingStatusAction.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 break-all">
                  {pendingStatusAction.email}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setPendingStatusAction(null)}
                  disabled={toggleActiveMutation.isPending}
                  className="px-5 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleToggleActive}
                  disabled={toggleActiveMutation.isPending}
                  className={`px-5 py-2 rounded-lg text-white transition disabled:opacity-70 disabled:cursor-not-allowed ${
                    pendingStatusAction.isActive
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {toggleActiveMutation.isPending
                    ? pendingStatusAction.isActive
                      ? "Deactivating..."
                      : "Activating..."
                    : pendingStatusAction.isActive
                      ? "Deactivate"
                      : "Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
