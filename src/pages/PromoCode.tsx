import React, { useState, useEffect } from "react";
import Table, { type Column } from "@/components/ui/Table";
import { User, Search, Upload, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  GetPromoCodes,
  SearchPromoCodes,
  CreatePromoCode,
  RenewPromoCode,
} from "@/lib/api/DiscountManagement";
import { useDebounce } from "use-debounce";
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

interface PromoCodeFormState {
  code: string;
  owner: string;
  discountPercentage: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

type ModalMode = "create" | "renew";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PromoCode: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null);
  const [promoForm, setPromoForm] = useState<PromoCodeFormState>({
    code: "",
    owner: "",
    discountPercentage: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });
  const [promoErrors, setPromoErrors] = useState<Partial<PromoCodeFormState>>({});

  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery({
    queryKey: ["promoCodes", debouncedSearchTerm, page, itemsPerPage],
    queryFn: async () => {
      const response = debouncedSearchTerm
        ? await SearchPromoCodes(debouncedSearchTerm, page - 1, itemsPerPage)
        : await GetPromoCodes(page - 1, itemsPerPage);
      return { promoCodes: response.content, totalElements: response.totalElements };
    },
  });

  const promoCodes = data?.promoCodes || [];
  const totalCount = data?.totalElements || 0;

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
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

  const formatDate = (dateString: string) => {
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

  const parseDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const dateStr = date.toISOString().split("T")[0];
    const timeStr = date.toTimeString().slice(0, 5);
    return { date: dateStr, time: timeStr };
  };

  const columns: Column[] = [
    {
      key: "code",
      label: "Code Name",
      render: (value) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {value}
        </span>
      ),
    },
    {
      key: "owner",
      label: "Owner",
      render: (value) => (
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
      key: "discountPercentage",
      label: "Discount (%)",
      render: (v) => (
        <span className="text-gray-900 dark:text-gray-100">{v}</span>
      ),
    },
    {
      key: "startTime",
      label: "Start Date",
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300">
          {formatDate(v)}
        </span>
      ),
    },
    {
      key: "endTime",
      label: "End Date",
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300">
          {formatDate(v)}
        </span>
      ),
    },
  ];

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedPromoCode(null);
    setPromoErrors({});
    setPromoForm({
      code: "",
      owner: "",
      discountPercentage: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    });
    setShowModal(true);
  };

  const openRenewModal = (promoCode: PromoCode) => {
    setModalMode("renew");
    setSelectedPromoCode(promoCode);
    setPromoErrors({});

    const startDateTime = parseDateTime(promoCode.startTime);
    const endDateTime = parseDateTime(promoCode.endTime);

    setPromoForm({
      code: promoCode.code,
      owner: promoCode.owner,
      discountPercentage: promoCode.discountPercentage.toString(),
      startDate: startDateTime.date,
      startTime: startDateTime.time,
      endDate: endDateTime.date,
      endTime: endDateTime.time,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitLoading) return;
    setShowModal(false);
    setSelectedPromoCode(null);
  };

  const renderActions = (row: PromoCode) => {
    return (
      <>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            openRenewModal(row);
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Renew Code
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            navigate(`/promo-enquires`, { state: { promoCode: row } });
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          View Registration
        </button>
      </>
    );
  };

  const handleExport = () => {
    if (promoCodes.length === 0) return;

    const exportData = promoCodes.map((c) => ({
      "Code Name": c.code,
      Owner: c.owner,
      "Discount (%)": c.discountPercentage,
      "Start Date": formatDate(c.startTime),
      "End Date": formatDate(c.endTime),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Promo Codes");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "Promo_Codes.xlsx");
  };

  const handlePromoChange = (
    field: keyof PromoCodeFormState,
    value: string
  ) => {
    setPromoForm((prev) => ({ ...prev, [field]: value }));
    setPromoErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validatePromoForm = () => {
    const errors: Partial<PromoCodeFormState> = {};

    if (modalMode === "create") {
      if (!promoForm.code.trim()) errors.code = "Code name is required";
      if (!promoForm.owner.trim()) errors.owner = "Owner is required";
    }

    if (!promoForm.discountPercentage.trim())
      errors.discountPercentage = "Discount percentage is required";
    else if (
      isNaN(Number(promoForm.discountPercentage)) ||
      Number(promoForm.discountPercentage) < 0 ||
      Number(promoForm.discountPercentage) > 100
    )
      errors.discountPercentage = "Must be a number between 0 and 100";
    if (!promoForm.startDate) errors.startDate = "Start date is required";
    if (!promoForm.startTime) errors.startTime = "Start time is required";
    if (!promoForm.endDate) errors.endDate = "End date is required";
    if (!promoForm.endTime) errors.endTime = "End time is required";

    if (
      promoForm.startDate &&
      promoForm.startTime &&
      promoForm.endDate &&
      promoForm.endTime
    ) {
      const startDateTime = new Date(
        `${promoForm.startDate}T${promoForm.startTime}`
      );
      const endDateTime = new Date(`${promoForm.endDate}T${promoForm.endTime}`);
      if (endDateTime <= startDateTime) {
        errors.endDate = "End date/time must be after start date/time";
      }
    }
    return errors;
  };

  const submitMutation = useMutation({
    mutationFn: async (payload: { mode: ModalMode; data: any }) => {
      if (payload.mode === "create") {
        return await CreatePromoCode(payload.data);
      } else {
        if (!selectedPromoCode) throw new Error("No promo code selected for renewal");
        return await RenewPromoCode(selectedPromoCode.id, payload.data);
      }
    },
    onSuccess: (response, variables) => {
      if (variables.mode === "create") {
        toast.success(`${response.code} code created successfully`);
      } else {
        toast.success(`Code renewed successfully`);
      }
      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });

      setPromoForm({
        code: "",
        owner: "",
        discountPercentage: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
      });
      setShowModal(false);
      setSelectedPromoCode(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  });

  const submitLoading = submitMutation.isPending;

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validatePromoForm();
    if (Object.keys(errors).length > 0) {
      setPromoErrors(errors);
      return;
    }

    const startDateTime = new Date(`${promoForm.startDate}T${promoForm.startTime}`);
    const endDateTime = new Date(`${promoForm.endDate}T${promoForm.endTime}`);

    if (modalMode === "create") {
      const payload = {
        code: promoForm.code,
        owner: promoForm.owner,
        discountPercentage: Number(promoForm.discountPercentage),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      };
      submitMutation.mutate({ mode: "create", data: payload });
    } else {
      const payload = {
        discountPercentage: Number(promoForm.discountPercentage),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      };
      submitMutation.mutate({ mode: "renew", data: payload });
    }
  };

  const isRenewMode = modalMode === "renew";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-8 md:w-full sm:w-auto w-[95vw]">
      <div className="md:w-full sm:w-auto w-[60vw]">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Promo Code
          </h1>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex gap-2 flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={() => fetchPromoCodes(searchTerm, page)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Search size={20} />
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} />
              Create Code
            </button>
            <button
              onClick={handleExport}
              disabled={promoCodes.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-white rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={18} />
              Export
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={promoCodes}
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

      {showModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 rounded-lg shadow-xl bg-white dark:bg-gray-800 z-[10001]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#1e293b] dark:bg-[#1e293b]">
              <h3 className="text-white font-semibold text-lg">
                {isRenewMode ? "Renew Code" : "Create Code"}
              </h3>
              <button
                className="text-white hover:text-gray-200"
                onClick={closeModal}
                disabled={submitLoading}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePromoSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Code Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter code name"
                    value={promoForm.code}
                    onChange={(e) => handlePromoChange("code", e.target.value)}
                    disabled={isRenewMode}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                      isRenewMode
                        ? "opacity-50 cursor-not-allowed"
                        : promoErrors.code
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                    }`}
                  />
                  {promoErrors.code && !isRenewMode && (
                    <p className="text-red-500 text-sm mt-1">
                      {promoErrors.code}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Owner
                  </label>
                  <input
                    type="text"
                    placeholder="Enter owner name"
                    value={promoForm.owner}
                    onChange={(e) => handlePromoChange("owner", e.target.value)}
                    disabled={isRenewMode}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                      isRenewMode
                        ? "opacity-50 cursor-not-allowed"
                        : promoErrors.owner
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                    }`}
                  />
                  {promoErrors.owner && !isRenewMode && (
                    <p className="text-red-500 text-sm mt-1">
                      {promoErrors.owner}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={promoForm.discountPercentage}
                  onChange={(e) =>
                    handlePromoChange("discountPercentage", e.target.value)
                  }
                  min="0"
                  max="100"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                    promoErrors.discountPercentage
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  }`}
                />
                {promoErrors.discountPercentage && (
                  <p className="text-red-500 text-sm mt-1">
                    {promoErrors.discountPercentage}
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Date & Time
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Start
                    </label>
                    <input
                      type="date"
                      placeholder="DD/MM/YYYY"
                      value={promoForm.startDate}
                      onChange={(e) =>
                        handlePromoChange("startDate", e.target.value)
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                        promoErrors.startDate
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                      }`}
                    />
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={promoForm.startTime}
                        onChange={(e) =>
                          handlePromoChange("startTime", e.target.value)
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                          promoErrors.startTime
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                        }`}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <input
                        type="radio"
                        id="24hour-start"
                        name="timeFormat"
                        defaultChecked
                      />
                      <label htmlFor="24hour-start">24-hour format</label>
                    </div>
                    {promoErrors.startDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {promoErrors.startDate}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      End
                    </label>
                    <input
                      type="date"
                      placeholder="DD/MM/YYYY"
                      value={promoForm.endDate}
                      onChange={(e) =>
                        handlePromoChange("endDate", e.target.value)
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                        promoErrors.endDate
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                      }`}
                    />
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={promoForm.endTime}
                        onChange={(e) =>
                          handlePromoChange("endTime", e.target.value)
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                          promoErrors.endTime
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                        }`}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <input
                        type="radio"
                        id="24hour-end"
                        name="timeFormatEnd"
                        defaultChecked
                      />
                      <label htmlFor="24hour-end">24-hour format</label>
                    </div>
                    {promoErrors.endDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {promoErrors.endDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitLoading
                    ? isRenewMode
                      ? "Renewing..."
                      : "Creating..."
                    : isRenewMode
                    ? "Renew"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCode;
