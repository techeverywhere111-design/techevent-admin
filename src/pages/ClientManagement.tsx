/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table, { type Column } from "@/components/ui/Table";
import { User, Search, Download } from "lucide-react";
import { getAccountUsers, searchAccountUsers } from "@/lib/api/UserEndPoint";
import { useDebounce } from "use-debounce";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Client {
  id: string;
  name: string;
  email: string;
  planType: "Personal" | "Business";
  dateJoined: string;
  avatar?: string | null;
}

const itemsPerPage = 10;

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const fetchClients = async (searchText = "", pageNumber: number = 1) => {
    try {
      setLoading(true);

      const response = searchText
        ? await searchAccountUsers(searchText, pageNumber - 1, itemsPerPage)
        : await getAccountUsers(pageNumber - 1, itemsPerPage);

      const mappedClients: Client[] = response.content.map((c) => {
        const displayName =
          c.name?.trim() || `${c.firstName} ${c.lastName}`.trim();
        const planType: "Personal" | "Business" = c.name
          ? "Business"
          : "Personal";

        return {
          id: c.id,
          name: displayName,
          email: c.email,
          planType,
          dateJoined: c.createdOn,
          avatar: c.imageUrl,
        };
      });

      setClients(mappedClients);
      setTotalCount(response.totalElements);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(debouncedSearchTerm, page);
  }, [debouncedSearchTerm, page]);

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
  const handleAuditLogs = (client: Client) =>
    navigate(`/clients/${client.id}/audit-logs`);

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

  const renderActions = (row: Client) => (
    <>
      <button
        onClick={() => handleViewProfile(row)}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        View Profile
      </button>
      <button
        onClick={() => handlePaymentHistory(row)}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Payment History
      </button>
      <button
        onClick={() => handleAuditLogs(row)}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Audit Logs
      </button>
    </>
  );

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
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={() => handleSearchInputChange(searchTerm)}
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
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setPage(p)}
          renderActions={renderActions}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ClientManagement;
