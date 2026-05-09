import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Table, { type Column } from "@/components/ui/Table";
import { ArrowLeft, Search, Upload, X } from "lucide-react";
import {
  GetPromoCodeRegistrationLogs,
  SearchPromoCodeRegistrationLogs,
  MarkAsSettled,
  MarkAsNotSettled,
} from "@/lib/api/DiscountManagement";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";

interface PromoCode {
  id: string;
  code: string;
  owner: string;
  discountPercentage: number;
  startTime: string;
  endTime: string;
  createdOn: string;
}

interface RegistrationLog {
  id: string;
  promoCode: string;
  userEmail: string;
  userPaidAmount: number;
  planAmount: number;
  hasSettled: boolean;
  settledDate: string;
  createdOn: string;
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ViewPromoRegistration: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const promoCode = location.state?.promoCode as PromoCode;

  const [searchTerm, setSearchTerm] = useState("");
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationLog | null>(null);

  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const queryClient = useQueryClient();

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const { data, isLoading: loading } = useQuery({
    queryKey: ["promoRegistrations", promoCode?.code, activeSearchTerm, page, itemsPerPage],
    queryFn: async () => {
      if (!promoCode?.code) throw new Error("No promo code provided");
      
      const response = activeSearchTerm
        ? await SearchPromoCodeRegistrationLogs(activeSearchTerm, promoCode.code, page - 1, itemsPerPage)
        : await GetPromoCodeRegistrationLogs(promoCode.code, page - 1, itemsPerPage);
        
      return { registrations: response.content, totalElements: response.totalElements };
    },
    enabled: !!promoCode?.code,
  });

  const registrations = data?.registrations || [];
  const totalCount = data?.totalElements || 0;

  useEffect(() => {
    if (!promoCode) {
      navigate("/promo-code");
    }
  }, [promoCode, navigate]);

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

  const openSettlementModal = (registration: RegistrationLog) => {
    setSelectedRegistration(registration);
    setShowSettlementModal(true);
  };

  const closeSettlementModal = () => {
    if (settlementLoading) return;
    setShowSettlementModal(false);
    setSelectedRegistration(null);
  };

  const toggleSettlementMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRegistration) throw new Error("No registration selected");
      if (selectedRegistration.hasSettled) {
        return await MarkAsNotSettled(selectedRegistration.id);
      } else {
        return await MarkAsSettled(selectedRegistration.id);
      }
    },
    onSuccess: (_, _variables) => {
      toast.success(`Successfully marked as ${selectedRegistration?.hasSettled ? "not settled" : "settled"}`);
      queryClient.invalidateQueries({ queryKey: ["promoRegistrations"] });
      closeSettlementModal();
    },
    onError: () => {
      toast.error("Failed to update settlement status");
    }
  });
  
  const settlementLoading = toggleSettlementMutation.isPending;

  const handleToggleSettlement = () => {
    toggleSettlementMutation.mutate();
  };

  const columns: Column[] = [
    {
      key: "userEmail",
      label: "Email",
      render: (value) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {value}
        </span>
      ),
    },
    {
      key: "createdOn",
      label: "Date | Time",
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300">
          {formatDate(v)}
        </span>
      ),
    },
    {
      key: "hasSettled",
      label: "Status",
      render: (value) => (
        <span
          className={`text-sm font-medium ${
            value
              ? "text-green-600 dark:text-green-400"
              : "text-orange-600 dark:text-orange-400"
          }`}
        >
          {value ? "SETTLED" : "NOT SETTLED"}
        </span>
      ),
    },
  ];

  const renderActions = (row: RegistrationLog) => {
    return (
      <>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            openSettlementModal(row);
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          {row.hasSettled ? "Mark as Not Settled" : "Mark as Settled"}
        </button>
      </>
    );
  };

  const handleExport = () => {
    if (registrations.length === 0) return;

    const exportData = registrations.map((reg) => ({
      Email: reg.userEmail,
      "Date | Time": formatDate(reg.createdOn),
      Status: reg.hasSettled ? "SETTLED" : "NOT SETTLED",
      "Paid Amount": reg.userPaidAmount,
      "Plan Amount": reg.planAmount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `${promoCode.code} Registrations`
    );

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, `${promoCode.code}_Registrations.xlsx`);
  };

  if (!promoCode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        <div>
          <h1 className="text-xl mb-6 sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Enquiries
          </h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/promo-code")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition flex-shrink-0"
          >
            <ArrowLeft size={20} className="text-gray-900 dark:text-gray-100" />
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              View Registration
            </span>
          </div>
        </div>

        {/* Promo Code Details Card */}
        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 border border-blue-100 dark:border-blue-800/50 rounded-lg p-4 sm:p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Code Name
              </p>
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 break-words">
                {promoCode.code}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Owner
              </p>
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 break-words">
                {promoCode.owner}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Discount (%)
              </p>
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                {promoCode.discountPercentage}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                Start Date
              </p>
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 break-words">
                {formatDate(promoCode.startTime)}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                End Date
              </p>
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 break-words">
                {formatDate(promoCode.endTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Registrations Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Registrations
          </h2>

          <div className="mb-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex-shrink-0"
              >
                <Search size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            <button
              onClick={handleExport}
              disabled={registrations.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-white rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <Upload size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span>Export</span>
            </button>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <Table
                  columns={columns}
                  data={registrations}
                  totalCount={totalCount}
                  itemsPerPage={itemsPerPage}
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
          </div>
        </div>
      </div>

      {/* Settlement Confirmation Modal */}
      {showSettlementModal && selectedRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-blue-100/20 backdrop-blur-sm dark:bg-blue-900/30"
            onClick={closeSettlementModal}
          ></div>

          <div className="relative w-112 md:w-96 rounded-lg overflow-hidden shadow-xl bg-white dark:bg-gray-800 transform transition-transform duration-300 scale-100">
            <div className="flex items-center justify-between px-4 py-2 bg-[#0B1E36] dark:bg-blue-900">
              <h3 className="text-white font-semibold text-lg">
                {selectedRegistration.hasSettled
                  ? "Mark as Not Settled?"
                  : "Mark as Settled?"}
              </h3>
              <button
                className="text-white font-bold text-lg"
                onClick={closeSettlementModal}
                disabled={settlementLoading}
              >
                ×
              </button>
            </div>

            <div className="p-6 py-16 text-center">
              <p className="text-gray-800 dark:text-gray-200 mb-14">
                Are you sure you want to mark{" "}
                <span className="font-semibold">
                  {selectedRegistration.userEmail}
                </span>{" "}
                as {selectedRegistration.hasSettled ? "not settled" : "settled"}
                ?
              </p>

              <div className="flex justify-center gap-12">
                <button
                  onClick={closeSettlementModal}
                  disabled={settlementLoading}
                  className="px-8 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  onClick={handleToggleSettlement}
                  disabled={settlementLoading}
                  className="px-8 py-2 bg-blue-500 rounded-md text-white font-semibold hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {settlementLoading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPromoRegistration;
