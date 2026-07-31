import React, { useMemo, useState } from "react";
import {
  Search,
  X,
  CreditCard,
  Download,
  Loader2,
  CalendarClock,
  Printer,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import Table, { type Column } from "@/components/ui/Table";
import {
  GetPlanPaymentHistories,
  SearchPlanPaymentHistories,
} from "@/lib/api/PlanPaymentEndpoint";
import type { PlanPaymentHistory } from "@/lib/schemas";
import { isPermissionDeniedError } from "@/lib/utils/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const getCurrencyCode = (currency?: string | null) => {
  const normalized = (currency ?? "NGN").toUpperCase();
  if (normalized === "USD") return "USD";
  return "NGN";
};

const formatPlanAmount = (
  amount: number | string | null | undefined,
  currency?: string | null,
) => {
  const numericAmount =
    typeof amount === "string"
      ? Number(amount.replace(/,/g, ""))
      : Number(amount);

  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;
  const currencyCode = getCurrencyCode(currency);

  return new Intl.NumberFormat(currencyCode === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "symbol",
    minimumFractionDigits: Number.isInteger(safeAmount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
};

const formatDate = (value?: string | null) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
};

const PaymentHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data, isLoading, error } = useQuery({
    queryKey: ["plan-payment-histories", activeSearchTerm, page, itemsPerPage],
    queryFn: async () => {
      const response = activeSearchTerm.trim()
        ? await SearchPlanPaymentHistories(
            activeSearchTerm.trim(),
            page - 1,
            itemsPerPage,
          )
        : await GetPlanPaymentHistories(page - 1, itemsPerPage);

      return {
        paymentHistories: response.content,
        totalElements: response.totalElements ?? 0,
      };
    },
  });

  const paymentHistories = data?.paymentHistories ?? [];
  const totalCount = data?.totalElements ?? 0;

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
    if (paymentHistories.length === 0) return;

    const exportData = paymentHistories.map((item) => ({
      "User Name":
        item.accountOwnerResponse?.name ||
        `${item.accountOwnerResponse?.firstName ?? ""} ${item.accountOwnerResponse?.lastName ?? ""}`.trim() ||
        "N/A",
      Email: item.email || item.accountOwnerResponse?.email || "N/A",
      "Plan Name": item.planResponse?.name || "N/A",
      "Plan Type": item.planResponse?.type || "N/A",
      "Plan Amount": formatPlanAmount(item.planAmount, item.currency),
      "Paid Amount": formatPlanAmount(item.paidAmount, item.currency),
      Currency: item.currency || "N/A",
      Channel: item.channel || "N/A",
      "Created On": formatDate(item.createdOn),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payment History");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "Payment_History.xlsx");
  };

  const handlePrintReceipt = (log: PlanPaymentHistory) => {
    const doc = new jsPDF();

    doc.setFillColor(35, 123, 230);
    doc.rect(0, 0, 210, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(33, 33, 33);
    doc.text("PLUTOSPACE EVENTS", 15, 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Subscription Payment Receipt", 15, 30);

    doc.setDrawColor(220, 220, 220);
    doc.line(15, 35, 195, 35);

    doc.setFont("helvetica", "bold");
    doc.text("Receipt ID:", 15, 45);
    doc.setFont("helvetica", "normal");
    doc.text(String(log.id || "N/A"), 55, 45);

    doc.setFont("helvetica", "bold");
    doc.text("Date:", 15, 52);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(log.createdOn), 55, 52);

    doc.setFont("helvetica", "bold");
    doc.text("Account Email:", 15, 59);
    doc.setFont("helvetica", "normal");
    doc.text(
      String(log.email || log.accountOwnerResponse?.email || "N/A"),
      55,
      59,
    );

    doc.setFont("helvetica", "bold");
    doc.text("Created By:", 15, 66);
    doc.setFont("helvetica", "normal");
    doc.text(String(log.createdBy || "N/A"), 55, 66);

    doc.line(15, 72, 195, 72);

    doc.setFillColor(245, 247, 250);
    doc.rect(15, 78, 180, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Subscription Information", 18, 83);

    doc.setFont("helvetica", "bold");
    doc.text("Plan:", 20, 93);
    doc.setFont("helvetica", "normal");
    doc.text(String(log.planResponse?.name || "N/A"), 55, 93);

    doc.setFont("helvetica", "bold");
    doc.text("Amount Paid:", 20, 100);
    doc.setFont("helvetica", "normal");
    doc.text(
      formatPlanAmount(log.paidAmount ?? log.planAmount, log.currency),
      55,
      100,
    );

    doc.setFont("helvetica", "bold");
    doc.text("Payment Mode:", 20, 107);
    doc.setFont("helvetica", "normal");
    doc.text(String(log.channel || "N/A"), 55, 107);

    doc.setFont("helvetica", "bold");
    doc.text("Duration:", 20, 114);
    doc.setFont("helvetica", "normal");
    doc.text("30 Days", 55, 114);

    doc.line(15, 120, 195, 120);

    doc.setFillColor(245, 247, 250);
    doc.rect(15, 126, 180, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Features Breakdown", 18, 131);

    const features = log.planResponse?.features;
    let yPos = 142;

    if (features) {
      if (features.meetingFeature) {
        const mf = features.meetingFeature;
        doc.setFont("helvetica", "bold");
        doc.text("Meetings:", 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(
          `${mf.numberAllowed || 0} allowed, Max ${mf.numberOfParticipants || 0} participants, Recording: ${mf.canRecord ? "Yes" : "No"}`,
          55,
          yPos,
        );
        yPos += 7;
      }

      if (features.eventFeature) {
        const ef = features.eventFeature;
        doc.setFont("helvetica", "bold");
        doc.text("Events:", 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(
          `${ef.numberAllowed || 0} events allowed, ${ef.numberOfForms || 0} forms, Paid Events: ${ef.allowPaidEvent ? "Yes" : "No"}`,
          55,
          yPos,
        );
        yPos += 7;
      }

      if (features.calendarFeature) {
        const cf = features.calendarFeature;
        doc.setFont("helvetica", "bold");
        doc.text("Calendar Slots:", 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(
          `${cf.numberOfAppointmentSlots || 0} slots, ${cf.numberOfSynchronization || 0} integrations`,
          55,
          yPos,
        );
        yPos += 7;
      }

      if (features.proposalFeature) {
        const pf = features.proposalFeature;
        doc.setFont("helvetica", "bold");
        doc.text("Proposals:", 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(
          `${pf.numberOfProposalsReceived || 0} received limit, Search Query Searchable: ${pf.canQueryProposalSearch ? "Yes" : "No"}`,
          55,
          yPos,
        );
        yPos += 7;
      }

      if (features.pollFeature) {
        const pl = features.pollFeature;
        doc.setFont("helvetica", "bold");
        doc.text("Polls & Q&As:", 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(
          `${pl.numberOfPolls || 0} polls, ${pl.numberOfPollVotes || 0} votes allowed, ${pl.numberOfQuestionAndAnswerSessions || 0} Q&A rooms`,
          55,
          yPos,
        );
        yPos += 7;
      }
    } else {
      doc.text("No specific feature details found for this plan.", 20, yPos);
    }

    doc.line(15, 260, 195, 260);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "Thank you for subscribing to Plutospace Events. For inquiries, contact support@plutospace.com",
      15,
      266,
    );

    doc.save(`Receipt_${log.id || "Subscription"}.pdf`);
  };

  const columns = useMemo<Column[]>(
    () => [
      {
        key: "accountOwnerResponse",
        label: "Customer",
        render: (_, row: PlanPaymentHistory) => {
          const owner = row.accountOwnerResponse;
          const name =
            owner?.name ||
            `${owner?.firstName ?? ""} ${owner?.lastName ?? ""}`.trim() ||
            "Unknown User";
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-white">
                {name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {owner?.email || row.email || "N/A"}
              </span>
            </div>
          );
        },
      },
      {
        key: "planResponse",
        label: "Plan",
        render: (value) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-white">
              {value?.name || "N/A"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {value?.type || "N/A"}
            </span>
          </div>
        ),
      },
      {
        key: "planAmount",
        label: "Plan Amount",
        render: (value, row: PlanPaymentHistory) => (
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {formatPlanAmount(value, row.currency)}
          </span>
        ),
      },
      {
        key: "paidAmount",
        label: "Paid Amount",
        render: (value, row: PlanPaymentHistory) => (
          <span className="font-semibold text-green-600 dark:text-green-400">
            {formatPlanAmount(value, row.currency)}
          </span>
        ),
      },
      {
        key: "channel",
        label: "Channel",
        render: (value) => (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {value || "N/A"}
          </span>
        ),
      },
      {
        key: "currency",
        label: "Currency",
        render: (value) => (
          <span className="text-gray-700 dark:text-gray-200 font-medium">
            {value || "N/A"}
          </span>
        ),
      },
      {
        key: "createdOn",
        label: "Date",
        render: (value) => (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <CalendarClock size={14} />
            <span>{formatDate(value)}</span>
          </div>
        ),
      },
    ],
    [],
  );

  const renderActions = (row: PlanPaymentHistory) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        handlePrintReceipt(row);
      }}
      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      <Printer size={16} />
      Print Receipt
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payment History
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track all plan payments and subscriptions across users.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition"
          >
            <Download size={18} />
            Export
          </button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <input
                type="text"
                placeholder="Search payment history..."
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Loading payment history...
            </p>
          </div>
        ) : error && !isPermissionDeniedError(error) ? (
          <div className="py-20 text-center border border-dashed border-red-300 dark:border-red-800/50 rounded-2xl bg-white dark:bg-gray-900 p-6">
            <CreditCard className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-500 font-semibold text-lg">
              Error loading payment history
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
              {(error as Error).message}
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={paymentHistories}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={(pageNumber) => setPage(pageNumber)}
            onPerPageChange={(newSize) => {
              setItemsPerPage(newSize);
              setPage(1);
            }}
            renderActions={renderActions}
            loading={isLoading}
            isUnauthorized={isPermissionDeniedError(error)}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
