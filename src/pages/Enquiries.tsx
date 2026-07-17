/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table, { type Column } from "@/components/ui/Table";
import { Search, Upload, X } from "lucide-react";
import { GetEnquiries, SearchEnquiries, MarkAsTreated, MarkAsNotTreated } from "@/lib/api/EnquiriesEndpoint";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { showErrorToast } from "@/lib/utils/toast";

interface EnquiryRow {
  id: string;
  name: string;
  businessName: string;
  email: string;
  subject: string;
  createdOn: string;
  treatedBy: string;
  status: "TREATED" | "NOT TREATED";
  original: any;
}

const Enquiries: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery({
    queryKey: ["enquiries", activeSearchTerm, page, itemsPerPage],
    queryFn: async () => {
      const response = activeSearchTerm
        ? await SearchEnquiries(activeSearchTerm, page - 1, itemsPerPage)
        : await GetEnquiries(page - 1, itemsPerPage);

      const mappedEnquiries: EnquiryRow[] = response.content.map((e) => ({
        id: e.id,
        name: e.name,
        businessName: e.businessName || "N/A",
        email: e.email,
        subject: e.subject || "N/A",
        createdOn: new Date(e.createdOn).toLocaleString(),
        treatedBy: e.treatedByUser ? `${e.treatedByUser.firstName || ""} ${e.treatedByUser.lastName || ""}`.trim() || e.treatedByUser.email : "N/A",
        status: e.isTreated ? "TREATED" : "NOT TREATED",
        original: e,
      }));

      return { enquiries: mappedEnquiries, totalElements: response.totalElements };
    },
  });

  const markAsTreatedMutation = useMutation({
    mutationFn: MarkAsTreated,
    onSuccess: () => {
      toast.success("Enquiry marked as treated");
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
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
    },
    onError: (err: any) => {
      showErrorToast(err.response?.data?.message || "Failed to update enquiry status");
    },
  });

  const enquiries = data?.enquiries || [];
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
      key: "subject",
      label: "Subject",
      render: (v) => <span className="text-gray-600 dark:text-gray-300" title={v as string}>{v}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (v) => (
        <span
          className={`font-semibold text-xs uppercase ${v === "TREATED" ? "text-blue-600" : "text-gray-500"
            }`}
        >
          {v}
        </span>
      ),
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
      Subject: e.subject,
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-5 md:w-full">
      <div className="md:w-full">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#1F2937] dark:text-white mb-6">
          Enquiries
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition"
          >
            <Upload size={18} />
            Export
          </button>
        </div>

        <Table
          columns={columns}
          data={enquiries}
          totalCount={totalCount}
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
