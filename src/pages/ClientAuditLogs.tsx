import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Table, { type Column } from "@/components/ui/Table";
import { Search, Download, ArrowLeft } from "lucide-react";
import { useDebounce } from "use-debounce";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  GetAccountAuditLogs,
  SearchAccountAuditLogs,
  type AuditLog,
} from "@/lib/api/AuditLogEndpoint";

import { useQuery } from "@tanstack/react-query";

const AuditLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const navigate = useNavigate();
  const location = useLocation();
  
  // Optionally still filter by clientId if passed via state, but not required in URL
  const clientId = location.state?.clientId;
  const clientName = location.state?.clientName;

  const { data, isLoading: loading } = useQuery({
    queryKey: ["auditLogs", debouncedSearchTerm, page, itemsPerPage, clientId],
    queryFn: () =>
      debouncedSearchTerm
        ? SearchAccountAuditLogs(debouncedSearchTerm, page - 1, itemsPerPage, clientId)
        : GetAccountAuditLogs(page - 1, itemsPerPage, clientId),
  });

  const logs = data?.content || [];
  const totalCount = data?.totalElements || 0;

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleExport = () => {
    if (logs.length === 0) return;

    const exportData = logs.map((log) => ({
      "Action Performed": log.actionPerformedSummary || log.actionPerformed,
      Module: log.module,
      "Performed By": log.accountUser?.email || "Unknown",
      "Date | Time": formatDate(log.createdOn),
      Location: log.location || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, `Audit_Logs_${(clientName || "General").replace(/\s+/g, "_")}.xlsx`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = hours.toString().padStart(2, "0");

    return `${day} - ${month} - ${year} ${formattedHours}:${minutes}${ampm}`;
  };

  const columns: Column[] = [
    {
      key: "actionPerformed",
      label: "Action Performed",
      render: (_, row: AuditLog) => (
        <span className="text-gray-900 dark:text-gray-100">
          {row.actionPerformedSummary || row.actionPerformed || "N/A"}
        </span>
      ),
    },
    {
      key: "module",
      label: "Module",
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300">{v || "N/A"}</span>
      ),
    },
    {
      key: "performedBy",
      label: "Performed By",
      render: (_, row: AuditLog) => (
        <span className="text-gray-600 dark:text-gray-300">
          {row.accountUser?.email || "N/A"}
        </span>
      ),
    },
    {
      key: "createdOn",
      label: "Date | Time",
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300">{formatDate(v)}</span>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300">{v || "N/A"}</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-8 md:w-full sm:w-auto w-[95vw]">
      <div className="md:w-full sm:w-auto w-[60vw]">

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
              Audit Logs {clientName ? `- ${clientName}` : ""}
            </h1>
          </div>
        </div>

        {/* Search & Export row */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex gap-2 flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Search logs..."
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

        {/* Table */}
        <Table
          columns={columns}
          data={logs}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setPage(p)}
          onPerPageChange={(newPerPage) => {
            setItemsPerPage(newPerPage);
            setPage(1);
          }}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AuditLogs;

