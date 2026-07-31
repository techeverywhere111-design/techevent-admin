import React, { useState, useMemo } from "react";

import Table, { type Column } from "@/components/ui/Table";
import { Download, Filter, X } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  FilterAuditLogs,
  type AuditLog,
} from "@/lib/api/AuditLogEndpoint";
import { useQuery } from "@tanstack/react-query";
import { formatDateTime } from "@/lib/utils/date";
import { isPermissionDeniedError } from "@/lib/utils/api";

const toLocalDatetimeString = (d: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const getDefaultStartTime = (): string => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return toLocalDatetimeString(d);
};

const getDefaultEndTime = (): string => {
  return toLocalDatetimeString(new Date());
};

const toISO = (localDatetime: string): string => {
  return new Date(localDatetime).toISOString();
};

const AuditLogs: React.FC = () => {
  const [module, setModule] = useState("");
  const [startTime, setStartTime] = useState(getDefaultStartTime);
  const [endTime, setEndTime] = useState(getDefaultEndTime);

  const [activeFilters, setActiveFilters] = useState({
    module: "",
    startTime: getDefaultStartTime(),
    endTime: getDefaultEndTime(),
  });

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateError, setDateError] = useState("");



  const isValidRange = activeFilters.startTime < activeFilters.endTime;

  const { data, isLoading: loading, error } = useQuery({
    queryKey: [
      "auditLogs",
      "filter",
      activeFilters.module,
      activeFilters.startTime,
      activeFilters.endTime,
      page,
      itemsPerPage,
    ],
    queryFn: () =>
      FilterAuditLogs({
        startTime: toISO(activeFilters.startTime),
        endTime: toISO(activeFilters.endTime),
        pageNo: page - 1,
        pageSize: itemsPerPage,
        module: activeFilters.module || undefined,
      }),
    enabled: isValidRange,
  });

  const logs = data?.content || [];
  const totalCount = data?.totalElements || 0;

  const hasActiveFilters = useMemo(
    () => activeFilters.module !== "",
    [activeFilters.module]
  );

  const handleApplyFilter = () => {
    if (endTime <= startTime) {
      setDateError("End time must be after start time");
      return;
    }
    setDateError("");
    setActiveFilters({
      module,
      startTime,
      endTime,
    });
    setPage(1);
  };

  const handleClearFilters = () => {
    const defaultStart = getDefaultStartTime();
    const defaultEnd = getDefaultEndTime();
    setModule("");
    setStartTime(defaultStart);
    setEndTime(defaultEnd);
    setActiveFilters({
      module: "",
      startTime: defaultStart,
      endTime: defaultEnd,
    });
    setPage(1);
  };

  const handleExport = () => {
    if (logs.length === 0) return;

    const exportData = logs.map((log) => ({
      "Action Performed": log.actionPerformedSummary || log.actionPerformed,
      Module: log.module,
      "Performed By": log.accountUser?.email || "Unknown",
      "Date | Time": formatDateTime(log.createdOn),
      Location: log.location || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, `Audit_Logs_Export.xlsx`);
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
        <span className="text-gray-600 dark:text-gray-300">{formatDateTime(v)}</span>
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
    <div className="min-h-full w-full min-w-0 bg-gray-50 p-4 transition-colors duration-300 dark:bg-gray-900 sm:p-5">
      <div className="w-full min-w-0">

        <div className="mb-6">
          <div className="flex items-center gap-4">

            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
              Audit Logs
            </h1>
          </div>
        </div>

        {/* Filter & Export row */}
        <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
          <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-end lg:flex-1">
            {/* Module */}
            <div className="flex w-full flex-col gap-1 sm:w-40">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Module
              </label>
              <input
                id="filter-module"
                type="text"
                placeholder="e.g. MEETING"
                value={module}
                onChange={(e) => setModule(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyFilter()}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            {/* Start Time */}
            <div className="flex w-full flex-col gap-1 sm:w-auto">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Start Time
              </label>
              <input
                id="filter-start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => { setStartTime(e.target.value); setDateError(""); }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:w-auto"
              />
            </div>

            {/* End Time */}
            <div className="flex w-full flex-col gap-1 sm:w-auto">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                End Time
              </label>
              <input
                id="filter-end-time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => { setEndTime(e.target.value); setDateError(""); }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:w-auto"
              />
            </div>

            {/* Filter + Clear buttons */}
            <div className="flex w-full gap-2 self-end sm:w-auto">
              <button
                id="apply-filter-btn"
                onClick={handleApplyFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <Filter size={16} />
                Apply
              </button>
              {hasActiveFilters && (
                <button
                  id="clear-filter-btn"
                  onClick={handleClearFilters}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all flex items-center gap-1 text-sm"
                >
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>
          </div>

          <button
            id="export-btn"
            onClick={handleExport}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600 transition-all hover:bg-blue-200 active:scale-95 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 lg:w-auto"
          >
            <Download size={18} />
            Export
          </button>
        </div>

        {dateError && (
          <div className="mb-4 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
            {dateError}
          </div>
        )}

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
          isUnauthorized={isPermissionDeniedError(error)}
        />
      </div>
    </div>
  );
};

export default AuditLogs;
