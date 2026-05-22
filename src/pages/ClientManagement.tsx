/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table, { type Column } from "@/components/ui/Table";
import { User, Search, Download, X } from "lucide-react";
import { GetAccountUsers, SearchAccountUsers } from "@/lib/api/UserEndPoint";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Client {
  id: string;
  accountId: string;
  name: string;
  email: string | null | undefined;
  planType: "Personal" | "Business";
  dateJoined: string;
  avatar: string | null | undefined;
}


import { useQuery } from "@tanstack/react-query";

const ClientManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  const { data, isLoading: loading } = useQuery({
    queryKey: ["clients", activeSearchTerm, page, itemsPerPage],
    queryFn: async () => {
      const response = activeSearchTerm
        ? await SearchAccountUsers(activeSearchTerm, page - 1, itemsPerPage)
        : await GetAccountUsers(page - 1, itemsPerPage);

      const mappedClients: Client[] = response.content.map((c) => {
        const displayName = c.name?.trim() || `${c.firstName || ""} ${c.lastName || ""}`.trim();

        const planType: "Personal" | "Business" = c.name ? "Business" : "Personal";
        return {
          id: c.id,
          accountId: c.accountId,
          name: displayName,
          email: c.email,
          planType,
          dateJoined: c.createdOn,
          avatar: c.imageUrl,
        };
      });

      return { clients: mappedClients, totalElements: response.totalElements };
    },
  });

  const clients = data?.clients || [];
  const totalCount = data?.totalElements || 0;

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
    navigate(`/clients/${client.id}/payments`);


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
      key: "dateJoined",
      label: "Date Joined",
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300">
          {new Date(v).toLocaleDateString()}
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
      </>
    );
  };

  const handleExport = () => {
    if (clients.length === 0) return;

    const exportData = clients.map((c) => ({
      Name: c.name,
      Email: c.email,
      "Plan Type": c.planType,
      "Date Joined": new Date(c.dateJoined).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "Clients_Management.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-8 md:w-full sm:w-auto w-[95vw]">
      <div className="md:w-full sm:w-auto w-[60vw]">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Clients Management
          </h1>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex gap-2 flex-1 sm:flex-initial">
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="px-4 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition"
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
        />
      </div>
    </div>
  );
};

export default ClientManagement;
