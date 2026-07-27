/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table, { type Column } from "@/components/ui/Table";
import { CheckCircle, Clock, Search, Upload, X } from "lucide-react";
import {
  GetEnquiries,
  GetPendingEnquiries,
  SearchEnquiries,
  SearchPendingEnquiries,
  MarkAsTreated,
  MarkAsNotTreated,
  ENQUIRY_CATEGORIES,
} from "@/lib/api/EnquiriesEndpoint";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { showErrorToast } from "@/lib/utils/toast";
import { formatDateTime } from "@/lib/utils/date";

const formatCategory = (cat?: string | null) => {
  if (!cat) return "N/A";
  return cat
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

interface EnquiryRow {
  id: string;
  name: string;
  businessName: string;
  email: string;
  category: string;
  subject: string;
  createdOn: string;
  treatedBy: string;
  status: "TREATED" | "NOT TREATED";
  original: any;
}

const Enquiries: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "pending">("all");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query overall total enquiries count from initial API so header badge stays consistent
  const { data: initialTotalData } = useQuery({
    queryKey: ["initialTotalEnquiriesCount"],
    queryFn: async () => {
      const res = await GetEnquiries(0, 1);
      return res.totalElements || 0;
    },
    staleTime: 60000,
  });

  const { data, isLoading: loading } = useQuery({
    queryKey: ["enquiries", viewMode, activeSearchTerm, selectedCategory, page, itemsPerPage],
    queryFn: async () => {
      const isSearching = !!activeSearchTerm;

      let response;
      if (viewMode === "pending") {
        response = isSearching
          ? await SearchPendingEnquiries(activeSearchTerm, page - 1, itemsPerPage, selectedCategory)
          : await GetPendingEnquiries(page - 1, itemsPerPage, selectedCategory);
      } else {
        response = isSearching
          ? await SearchEnquiries(activeSearchTerm, page - 1, itemsPerPage, selectedCategory)
          : await GetEnquiries(page - 1, itemsPerPage, selectedCategory);
      }

      const mappedEnquiries: EnquiryRow[] = response.content.map((e) => {
        let treatedByStr = "N/A";
        if (e.treatedByUser) {
          const fullName = [e.treatedByUser.firstName, e.treatedByUser.lastName].filter(Boolean).join(" ").trim();
          treatedByStr = fullName || e.treatedByUser.email || "N/A";
        } else if (e.treatedBy) {
          treatedByStr = e.treatedBy;
        }

        const rawCategory = e.enquiryCategory || e.category;

        return {
          id: e.id,
          name: e.name,
          businessName: e.businessName || "N/A",
          email: e.email,
          category: formatCategory(rawCategory),
          subject: e.subject || "N/A",
          createdOn: formatDateTime(e.createdOn),
          treatedBy: treatedByStr,
          status: e.isTreated ? "TREATED" : "NOT TREATED",
          original: e,
        };
      });

      return { enquiries: mappedEnquiries, totalElements: response.totalElements };
    },
  });

  const markAsTreatedMutation = useMutation({
    mutationFn: MarkAsTreated,
    onSuccess: () => {
      toast.success("Enquiry marked as treated");
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      queryClient.invalidateQueries({ queryKey: ["initialTotalEnquiriesCount"] });
    },
    onError: (err: any) => {
      showErrorToast(err.response?.data?.message || "Failed to update enquiry status");
    },
  });

  const markAsNotTreatedMutation = useMutation({
    mutationFn: MarkAsNotTreated,
    onSuccess: () => {
      toast.success("Enquiry marked as not treated");
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      queryClient.invalidateQueries({ queryKey: ["initialTotalEnquiriesCount"] });
    },
    onError: (err: any) => {
      showErrorToast(err.response?.data?.message || "Failed to update enquiry status");
    },
  });

  const enquiries = data?.enquiries || [];
  const currentTotalElements = data?.totalElements || 0;
  const overallTotalCount = initialTotalData !== undefined ? initialTotalData : currentTotalElements;

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setPage(1);
  };

  const handleClear = () => {
    setSearchTerm("");
    setActiveSearchTerm("");
    setSelectedCategory("");
    setPage(1);
  };

  const handleViewModeChange = (mode: "all" | "pending") => {
    setViewMode(mode);
    setPage(1);

    if (mode === "pending") {
      setSearchTerm("");
      setActiveSearchTerm("");
    }
  };

  const columns: Column[] = [
    {
      key: "name",
      label: "Name",
      render: (v) => <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{v}</span>,
    },
    {
      key: "email",
      label: "Email",
      render: (v) => <span className="text-gray-600 dark:text-gray-300">{v}</span>,
    },
    {
      key: "category",
      label: "Category",
      render: (v) => <span className="text-gray-600 dark:text-gray-300 font-medium">{v as string}</span>,
    },
    {
      key: "subject",
      label: "Subject",
      render: (v) => <span className="text-gray-600 dark:text-gray-300" title={v as string}>{v}</span>,
    },
    {
      key: "treatedBy",
      label: "Treated By",
      render: (v) => <span className="text-gray-600 dark:text-gray-300">{v as string}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (v) => {
        const isTreated = v === "TREATED";
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
              isTreated
                ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
            }`}
          >
            {isTreated ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            )}
          </span>
        );
      },
    },
  ];

  const handleView = (row: EnquiryRow) => navigate(`/enquiries/${row.id}`, { state: { enquiry: row.original } });

  const renderActions = (row: EnquiryRow) => (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleView(row);
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        View
      </button>
      {row.status === "TREATED" ? (<button
        onClick={(e) => {
          e.stopPropagation();
          markAsNotTreatedMutation.mutate(row.id);
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        Mark as Not Treated
      </button>) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            markAsTreatedMutation.mutate(row.id);
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Mark as Treated
        </button>
      )}
    </>
  );

  const handleExport = () => {
    if (enquiries.length === 0) return;
    const exportData = enquiries.map((e) => ({
      Name: e.name,
      Email: e.email,
      Category: e.category,
      Subject: e.subject,
      "Treated By": e.treatedBy,
      Status: e.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Enquiries");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "Enquiries.xlsx");
  };

  return (
    <div className="min-h-full w-full min-w-0 bg-gray-50 p-4 dark:bg-gray-900 sm:p-5">
      <div className="w-full min-w-0">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1F2937] dark:text-white">
            Enquiries
          </h1>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm font-medium">
            Total: {overallTotalCount}
          </span>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-auto">
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
              >
                <Search size={20} />
              </button>
            </div>

            <div className="mt-3 ml-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleViewModeChange("all")}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition ${viewMode === "all"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange("pending")}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition ${viewMode === "pending"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                Pending
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              {ENQUIRY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="capitalize">
                  {cat.replace(/_/g, " ")?.toLowerCase()}
                </option>
              ))}
            </select>

            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition"
            >
              <Upload size={15} />
              Export
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={enquiries}
          totalCount={currentTotalElements}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          onPerPageChange={(newSize) => {
            setItemsPerPage(newSize);
            setPage(1);
          }}
          renderActions={renderActions}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Enquiries;
