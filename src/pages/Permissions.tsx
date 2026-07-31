/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Table, { type Column } from "@/components/ui/Table";
import { Search, X } from "lucide-react";
import {
  GetPermissions,
  SearchPermissions,
} from "@/lib/api/PermissionEndpoint";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDateTime } from "@/lib/utils/date";
import { isPermissionDeniedError } from "@/lib/utils/api";




const Permissions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);


  const { data, isLoading: loading, error } = useQuery({
    queryKey: ["permissions", activeSearchTerm, page, itemsPerPage],
    queryFn: async () => {
      let response;
      if (activeSearchTerm) {
        try {
          response = await SearchPermissions(activeSearchTerm, page - 1, itemsPerPage);
        } catch (_err) {
          response = await GetPermissions(page - 1, itemsPerPage);
        }
      } else {
        response = await GetPermissions(page - 1, itemsPerPage);
      }



      return { permissions: response.content, totalElements: response.totalElements };
    },
  });

  const permissions = data?.permissions || [];
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

  const handleExport = () => {
    if (permissions.length === 0) return;
    const exportData = permissions.map((p) => ({
      Name: p.name,
      Module: p.module,
      Method: p.method,
      Endpoint: p.endpoint,
      Description: p.description,
      "Plan Feature": p.planFeature,
      General: p.isGeneral ? "Yes" : "No",
      "Date Created": formatDateTime(p.createdOn),
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Permissions");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "Permissions.xlsx");
  };



  const columns: Column[] = [
    {
      key: "name",
      label: "Name",
      render: (v) => <span className="text-gray-900 dark:text-gray-100 font-medium">{v}</span>,
    },
    {
      key: "module",
      label: "Module",
      render: (v) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
          {v}
        </span>
      ),
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
      key: "endpoint",
      label: "Endpoint",
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300 font-mono text-xs">{v}</span>
      ),
    },
    {
      key: "isGeneral",
      label: "General",
      render: (v) => (
        <span
          className={`text-xs font-semibold ${v ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"
            }`}
        >
          {v ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "createdOn",
      label: "Created",
      render: (v) => (
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {formatDateTime(v)}
        </span>
      ),
    },
  ];




  return (
    <div className="min-h-full w-full min-w-0 bg-gray-50 p-4 dark:bg-gray-900 sm:p-5">
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Permissions
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search permissions..."
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

          <div className="flex gap-3">

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition"
            >
              <Upload size={18} />
              Export
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={permissions}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          onPerPageChange={(newSize) => {
            setItemsPerPage(newSize);
            setPage(1);
          }}
          loading={loading}
          isUnauthorized={isPermissionDeniedError(error)}
        />
      </div>


    </div>
  );
};

export default Permissions;
