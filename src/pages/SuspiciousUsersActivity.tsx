import React, { useState, useMemo } from "react";
import Table, { type Column } from "@/components/ui/Table";
import { Search, Upload, X } from "lucide-react";
import { GetSuspiciousUsers, GetSuspiciousActivities } from "@/lib/api/SuspiciousUsersEndpoint";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useQuery } from "@tanstack/react-query";
import { formatDateTime } from "@/lib/utils/date";

interface SelectedImageState {
  url: string;
  name: string;
}

const SuspiciousUsersActivity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"users" | "activities">( "users");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedImage, setSelectedImage] = useState<SelectedImageState | null>(null);

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ["suspicious-users", page, itemsPerPage],
    queryFn: () => GetSuspiciousUsers(page - 1, itemsPerPage),
    enabled: activeTab === "users",
  });

  const { data: activitiesData, isLoading: loadingActivities } = useQuery({
    queryKey: ["suspicious-activities", page, itemsPerPage],
    queryFn: () => GetSuspiciousActivities(page - 1, itemsPerPage),
    enabled: activeTab === "activities",
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

  const users = useMemo(() => {
    const rawContent = usersData?.content || [];
    if (!activeSearchTerm) return rawContent;
    const term = activeSearchTerm.toLowerCase();
    return rawContent.filter((u) => {
      const name = `${u.accountUserResponse?.firstName || ""} ${u.accountUserResponse?.lastName || ""}`.trim() || u.accountUserResponse?.name || "";
      const email = u.accountUserResponse?.email || "";
      const createdBy = u.createdBy || "";
      return (
        name.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        createdBy.toLowerCase().includes(term)
      );
    });
  }, [usersData, activeSearchTerm]);

  const activities = useMemo(() => {
    const rawContent = activitiesData?.content || [];
    if (!activeSearchTerm) return rawContent;
    const term = activeSearchTerm.toLowerCase();
    return rawContent.filter((a) => {
      const name = `${a.accountUserResponse?.firstName || ""} ${a.accountUserResponse?.lastName || ""}`.trim() || a.accountUserResponse?.name || "";
      const email = a.accountUserResponse?.email || "";
      const createdBy = a.createdBy || "";
      const action = a.actionPerformed || "";
      const endpoint = a.endpoint || "";
      return (
        name.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        createdBy.toLowerCase().includes(term) ||
        action.toLowerCase().includes(term) ||
        endpoint.toLowerCase().includes(term)
      );
    });
  }, [activitiesData, activeSearchTerm]);

  const totalCount = activeTab === "users"
    ? (activeSearchTerm ? users.length : usersData?.totalElements || 0)
    : (activeSearchTerm ? activities.length : activitiesData?.totalElements || 0);

  const loading = activeTab === "users" ? loadingUsers : loadingActivities;

  const handleExport = () => {
    if (activeTab === "users") {
      if (users.length === 0) return;
      const exportData = users.map((u) => {
        const userDetails = u.accountUserResponse;
        const name = userDetails ? `${userDetails.firstName || ""} ${userDetails.lastName || ""}`.trim() || userDetails.name : "N/A";
        return {
          "Created By": u.createdBy || "N/A",
          "User Name": name || "N/A",
          "User Email": userDetails?.email || "N/A",
          "User Active Status": userDetails?.isActive ? "Active" : "Inactive",
          "Last Login": formatDateTime(userDetails?.lastLogin),
          "Occurrences": u.numberOfOccurrences,
          "Blocked Status": u.isBlocked ? "Blocked" : "Active",
          "Created On": formatDateTime(u.createdOn),
          "Updated On": formatDateTime(u.updatedOn),
        };
      });
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Suspicious Users");
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      saveAs(blob, "Suspicious_Users.xlsx");
    } else {
      if (activities.length === 0) return;
      const exportData = activities.map((a) => {
        const userDetails = a.accountUserResponse;
        const name = userDetails ? `${userDetails.firstName || ""} ${userDetails.lastName || ""}`.trim() || userDetails.name : "N/A";
        return {
          "Created By": a.createdBy || "N/A",
          "User Name": name || "N/A",
          "User Email": userDetails?.email || "N/A",
          "User Active Status": userDetails?.isActive ? "Active" : "Inactive",
          "Last Login": formatDateTime(userDetails?.lastLogin),
          "Action Performed": a.actionPerformed || "N/A",
          "Endpoint": a.endpoint || "N/A",
          "Method": a.method || "N/A",
          "Created On": formatDateTime(a.createdOn),
        };
      });
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Suspicious Activities");
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      saveAs(blob, "Suspicious_Activities.xlsx");
    }
  };

  const renderUserCell = (accountUser: any) => {
    if (!accountUser) return <span className="text-gray-400 dark:text-gray-500">N/A</span>;
    const name = `${accountUser.firstName || ""} ${accountUser.lastName || ""}`.trim() || accountUser.name || "N/A";
    const email = accountUser.email || "N/A";
    const imageUrl = accountUser.imageUrl;

    return (
      <div className="flex items-center gap-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-10 h-10 rounded-full object-cover cursor-pointer border border-gray-200 dark:border-gray-700 hover:opacity-80 transition"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage({ url: imageUrl, name });
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold text-sm">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{email}</span>
        </div>
      </div>
    );
  };

  const userColumns: Column[] = [
    {
      key: "createdBy",
      label: "Created By",
      render: (v) => <span className="text-gray-600 dark:text-gray-300 font-medium">{v || "N/A"}</span>,
    },
    {
      key: "user",
      label: "Account User",
      render: (_, row) => renderUserCell(row.accountUserResponse),
    },
    {
      key: "isActive",
      label: "Active Status",
      render: (_, row) => {
        const active = row.accountUserResponse?.isActive;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            active ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
          }`}>
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (_, row) => {
        const lastLogin = row.accountUserResponse?.lastLogin;
        return (
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {formatDateTime(lastLogin)}
          </span>
        );
      },
    },
    {
      key: "numberOfOccurrences",
      label: "Occurrences",
      render: (v) => <span className="text-gray-900 dark:text-gray-100 font-semibold">{v}</span>,
    },
    {
      key: "isBlocked",
      label: "Blocked Status",
      render: (v) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          v ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
        }`}>
          {v ? "Blocked" : "Active"}
        </span>
      ),
    },
    {
      key: "createdOn",
      label: "Created On",
      render: (v) => (
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {formatDateTime(v)}
        </span>
      ),
    },
    {
      key: "updatedOn",
      label: "Updated On",
      render: (v) => (
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {formatDateTime(v)}
        </span>
      ),
    },
  ];

  const activityColumns: Column[] = [
    {
      key: "createdBy",
      label: "Created By",
      render: (v) => <span className="text-gray-600 dark:text-gray-300 font-medium">{v || "N/A"}</span>,
    },
    {
      key: "user",
      label: "Account User",
      render: (_, row) => renderUserCell(row.accountUserResponse),
    },
    {
      key: "isActive",
      label: "Active Status",
      render: (_, row) => {
        const active = row.accountUserResponse?.isActive;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            active ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
          }`}>
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (_, row) => {
        const lastLogin = row.accountUserResponse?.lastLogin;
        return (
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {formatDateTime(lastLogin)}
          </span>
        );
      },
    },
    {
      key: "actionPerformed",
      label: "Action",
      render: (v) => <span className="text-gray-900 dark:text-gray-100 font-medium">{v}</span>,
    },
    {
      key: "endpoint",
      label: "Endpoint",
      render: (v) => <span className="text-gray-600 dark:text-gray-300 font-mono text-xs">{v}</span>,
    },
    {
      key: "method",
      label: "Method",
      render: (v) => {
        const colors: Record<string, string> = {
          GET: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
          POST: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
          PUT: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
          DELETE: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
          PATCH: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[v] || ""}`}>
            {v}
          </span>
        );
      },
    },
    {
      key: "createdOn",
      label: "Created On",
      render: (v) => (
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {formatDateTime(v)}
        </span>
      ),
    },
  ];

  const tabs = [
    { id: "users", name: "Suspicious Users" },
    { id: "activities", name: "Suspicious Activities" },
  ];

  return (
    <div className="min-h-full w-full min-w-0 bg-gray-50 p-4 dark:bg-gray-900 sm:p-5">
      <div className="w-full min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#1F2937] dark:text-white mb-6">
          Suspicious Users & Activity
        </h1>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as "users" | "activities");
                setPage(1);
                setSearchTerm("");
                setActiveSearchTerm("");
              }}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder={activeTab === "users" ? "Search users..." : "Search activities..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
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

          <button
            onClick={handleExport}
            disabled={activeTab === "users" ? users.length === 0 : activities.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={18} />
            Export
          </button>
        </div>

        {/* Table */}
        <Table
          columns={activeTab === "users" ? userColumns : activityColumns}
          data={activeTab === "users" ? users : activities}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          onPerPageChange={(newSize) => {
            setItemsPerPage(newSize);
            setPage(1);
          }}
          loading={loading}
        />
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] p-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-2 transition-colors"
            >
              <X size={20} />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="max-w-full max-h-[70vh] rounded-md object-contain"
            />
            <div className="mt-4 text-center pb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedImage.name}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuspiciousUsersActivity;
