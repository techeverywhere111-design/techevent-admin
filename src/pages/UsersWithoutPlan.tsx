import React, { useState } from "react";
import Table, { type Column } from "@/components/ui/Table";
import { GetUsersWithoutPlan, type AccountUser } from "@/lib/api/UserEndPoint";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { formatDateTime } from "@/lib/utils/date";
import { isPermissionDeniedError } from "@/lib/utils/api";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-cyan-500",
];

const getAvatarColor = (seed: string) => {
  if (!seed) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const UserAvatar: React.FC<{ imageUrl?: string | null; name: string; email?: string | null }> = ({
  imageUrl,
  name,
  email,
}) => {
  const [hasError, setHasError] = useState(false);

  if (imageUrl && !hasError) {
    return (
      <img
        src={imageUrl}
        alt={name || "User"}
        onError={() => setHasError(true)}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700"
      />
    );
  }

  const initial = (name || email || "U").trim().charAt(0).toUpperCase();

  return (
    <div
      className={`w-8 h-8 rounded-full ${getAvatarColor(
        name || email || ""
      )} flex items-center justify-center flex-shrink-0 text-white font-medium text-xs shadow-sm`}
    >
      {initial}
    </div>
  );
};

const UsersWithoutPlan: React.FC = () => {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["users-without-plan", page, itemsPerPage],
    queryFn: async () => {
      const response = await GetUsersWithoutPlan(page - 1, itemsPerPage);
      return {
        users: response.content || [],
        totalElements: response.totalElements ?? 0,
      };
    },
    placeholderData: keepPreviousData,
  });

  const users = data?.users || [];
  const totalCount = data?.totalElements || 0;

  const columns: Column[] = [
    {
      key: "name",
      label: "User",
      render: (_value, row: AccountUser) => {
        const displayName =
          [row.firstName, row.lastName].filter(Boolean).join(" ") ||
          row.name ||
          "Unnamed User";

        return (
          <div className="flex items-center gap-3">
            <UserAvatar imageUrl={row.imageUrl} name={displayName} email={row.email} />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {displayName}
            </span>
          </div>
        );
      },
    },
    {
      key: "email",
      label: "Email",
      render: (value: string | null) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {value || "—"}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (value: boolean | null | undefined) => {
        const active = value ?? true;
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              active
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                active ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            {active ? "ACTIVE" : "INACTIVE"}
          </span>
        );
      },
    },
    {
      key: "createdOn",
      label: "Date Joined",
      render: (value: string) => (
        <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
          {formatDateTime(value)}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-full w-full min-w-0 bg-gray-50 p-4 transition-colors duration-300 dark:bg-gray-900 sm:p-6">
      <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Client Management</span>
            <span>/</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Users Without Plan
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Users Without Plan
          </h1>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800/80 overflow-hidden">
          <Table
            columns={columns}
            data={users}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
            onPerPageChange={(newPerPage) => {
              setItemsPerPage(newPerPage);
              setPage(1);
            }}
            loading={loading}
            isUnauthorized={isPermissionDeniedError(error)}
          />
        </div>
      </div>
    </div>
  );
};

export default UsersWithoutPlan;
