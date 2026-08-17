import React, { useMemo, useState } from "react";
import {
  CreditCard,
  Download,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import Table, { type Column } from "@/components/ui/Table";
import { GetClientPlanPaymentHistories } from "@/lib/api/PlanPaymentEndpoint";
import { GetBulkAccountUsers } from "@/lib/api/UserEndPoint";
import type { Plan, PlanPaymentHistory } from "@/lib/schemas";
import { isPermissionDeniedError } from "@/lib/utils/api";
import logoSrc from "@/assets/PlutoEvent_Logo.png";

// ── Helpers ────────────────────────────────────────────────────────────────────
const getCurrencyCode = (currency?: string | null) => {
  const normalized = (currency ?? "NGN").toUpperCase();
  return normalized === "USD" ? "USD" : "NGN";
};

const formatPlanAmount = (
  amount: number | string | null | undefined,
  currency?: string | null
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
};

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const formatDate = (value?: string | null) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "N/A";
  const day = ordinal(d.getDate());
  const month = d.toLocaleString("en-US", { month: "long" });
  const year = d.getFullYear();
  const time = d
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
  return `${day} of ${month}, ${year} ${time}`;
};

// ── Component ──────────────────────────────────────────────────────────────────
const ClientPaymentHistory: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ── Fetch client name / account info ─────────────────────────────────────────
  const { data: clientUser } = useQuery({
    queryKey: ["clientUser", accountId],
    queryFn: async () => {
      if (!accountId) return null;
      try {
        const users = await GetBulkAccountUsers([accountId]);
        return users[0] ?? null;
      } catch (_err) {
        return null;
      }
    },
    enabled: !!accountId,
  });

  const targetAccountId = clientUser?.accountId || accountId;

  // ── Fetch payment records ────────────────────────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "client-payment-histories",
      targetAccountId,
      page,
      itemsPerPage,
    ],
    queryFn: async () => {
      if (!targetAccountId) throw new Error("No account ID");
      const response = await GetClientPlanPaymentHistories(
        targetAccountId,
        page - 1,
        itemsPerPage
      );
      return {
        paymentHistories: response.content,
        totalElements: response.totalElements ?? 0,
      };
    },
    placeholderData: keepPreviousData,
    enabled: !!targetAccountId,
  });

  const paymentHistories = data?.paymentHistories ?? [];
  const totalCount = data?.totalElements ?? 0;

  const fallbackOwner = paymentHistories[0]?.accountOwnerResponse;
  const clientName = clientUser
    ? (clientUser.name?.trim() ||
        `${clientUser.firstName ?? ""} ${clientUser.lastName ?? ""}`.trim() ||
        clientUser.email ||
        "Unknown")
    : fallbackOwner
    ? (fallbackOwner.name?.trim() ||
        `${fallbackOwner.firstName ?? ""} ${fallbackOwner.lastName ?? ""}`.trim() ||
        fallbackOwner.email ||
        "Unknown")
    : "—";

  // ── Export ───────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (paymentHistories.length === 0) return;
    const exportData = paymentHistories.map((item) => ({
      Date: formatDate(item.createdOn),
      Amount: formatPlanAmount(item.paidAmount ?? item.planAmount, item.currency),
      Medium: item.channel || "N/A",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payment History");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `Payment_History_${clientName}.xlsx`
    );
  };

  // ── PDF Receipt (identical generator to PaymentHistory) ─────────────────────
  const handlePrintReceipt = (log: PlanPaymentHistory) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = 210;
    const marginL = 14;
    const marginR = 14;
    const contentW = pageW - marginL - marginR;

    const ordinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    const formatReceiptDate = (dateStr?: string | null) => {
      if (!dateStr) return "N/A";
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "N/A";
      return `${ordinal(d.getDate())} of ${d.toLocaleString("en-US", { month: "long" })}, ${d.getFullYear()}`;
    };
    const formatReceiptTime = (dateStr?: string | null) => {
      if (!dateStr) return "N/A";
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "N/A";
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
    };

    const buildReceiptFeatures = (features?: Plan["features"] | null) => {
      const items: string[] = [];
      if (!features) return items;
      const f = features as Record<string, any>;
      const mf = f.meetingFeature;
      if (mf) {
        if ((mf.numberAllowed ?? 0) > 0) items.push(`${mf.numberAllowed} Meetings Allowed`);
        if ((mf.numberOfParticipants ?? 0) > 0) items.push(`${mf.numberOfParticipants} Meeting Participants`);
        if (mf.canRecord) items.push("Meeting Recording Enabled");
      }
      const ef = f.eventFeature;
      if (ef) {
        if ((ef.numberAllowed ?? 0) > 0) items.push(`${ef.numberAllowed} Events Allowed`);
        if ((ef.numberOfForms ?? 0) > 0) items.push(`${ef.numberOfForms} Event Forms`);
        if (ef.allowPaidEvent) items.push("Paid Events Supported");
      }
      const cf = f.calendarFeature;
      if (cf) {
        if ((cf.numberOfSynchronization ?? 0) > 0)
          items.push(`${cf.numberOfSynchronization} Calendar Integration${(cf.numberOfSynchronization ?? 0) > 1 ? "s" : ""}`);
        if ((cf.numberOfAppointmentSlots ?? 0) > 0) items.push(`${cf.numberOfAppointmentSlots} Appointment Slots`);
      }
      const pf = f.proposalFeature;
      if (pf) {
        if ((pf.numberOfProposalsReceived ?? 0) > 0) items.push(`${pf.numberOfProposalsReceived} Proposal Submissions`);
        if (pf.canQueryProposalSearch) items.push("Proposal Search Enabled");
      }
      const pl = f.pollFeature;
      if (pl) {
        if ((pl.numberOfPolls ?? 0) > 0) items.push(`${pl.numberOfPolls} Polls`);
        if ((pl.numberOfPollVotes ?? 0) > 0) items.push(`${pl.numberOfPollVotes} Votes Per Poll`);
        if ((pl.numberOfQuestionAndAnswerSessions ?? 0) > 0)
          items.push(`${pl.numberOfQuestionAndAnswerSessions} Q&A Session${(pl.numberOfQuestionAndAnswerSessions ?? 0) > 1 ? "s" : ""}`);
        if ((pl.numberOfQuestionsSent ?? 0) > 0) items.push(`${pl.numberOfQuestionsSent} Questions Per Q&A`);
      }
      const af = f.accountFeature;
      if (af) {
        if ((af.numberOfInvites ?? 0) > 0) items.push(`${af.numberOfInvites} Team Member Invites`);
        if ((af.numberOfSessions ?? 0) > 0) items.push(`${af.numberOfSessions} Active Sessions`);
      }
      return items;
    };

    const drawSectionHeader = (label: string, y: number) => {
      doc.setFillColor(176, 196, 222);
      doc.roundedRect(marginL, y, contentW, 8, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 40, 60);
      doc.text(label, marginL + 3, y + 5.5);
    };

    const drawInfoRow = (label: string, value: string, y: number) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 100, 110);
      doc.text(label, marginL + 2, y + 4.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 25, 35);
      doc.text(value, pageW - marginR - 2, y + 4.5, { align: "right" });
      doc.setDrawColor(220, 225, 230);
      doc.setLineWidth(0.2);
      doc.line(marginL, y + 8, pageW - marginR, y + 8);
      return y + 9;
    };

    const drawAmountRow = (label: string, amount: number, currCode: string, y: number) => {
      const symbol = currCode === "NGN" ? "\u20A6" : "$";
      const numStr = currCode === "NGN"
        ? amount.toLocaleString("en-NG")
        : amount.toLocaleString("en-US");
      const fullStr = symbol + numStr;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 100, 110);
      doc.text(label, marginL + 2, y + 4.5);

      const PX = 52;
      const measureC = document.createElement("canvas");
      const mCtx = measureC.getContext("2d")!;
      mCtx.font = `bold ${PX}px Arial, sans-serif`;
      const measured = mCtx.measureText(fullStr);
      const sc = document.createElement("canvas");
      sc.width = Math.ceil(measured.width) + 8;
      sc.height = PX + 16;
      const sCtx = sc.getContext("2d")!;
      sCtx.font = `bold ${PX}px Arial, sans-serif`;
      sCtx.fillStyle = "#141923";
      sCtx.textBaseline = "middle";
      sCtx.fillText(fullStr, 4, sc.height / 2);

      const targetH = 3.6;
      const scale = targetH / sc.height;
      const imgW = sc.width * scale;
      const imgX = pageW - marginR - 2 - imgW;
      const imgY = y + 4.5 - targetH / 2;
      try { doc.addImage(sc.toDataURL("image/png"), "PNG", imgX, imgY, imgW, targetH); } catch (_) {}

      doc.setDrawColor(220, 225, 230);
      doc.setLineWidth(0.2);
      doc.line(marginL, y + 8, pageW - marginR, y + 8);
      return y + 9;
    };

    const drawFeatureRow = (text: string, y: number) => {
      doc.setDrawColor(39, 174, 96);
      doc.setLineWidth(0.6);
      doc.line(marginL + 3.2, y + 3.6, marginL + 4.5, y + 5.0);
      doc.line(marginL + 4.5, y + 5.0, marginL + 7.0, y + 2.2);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(30, 40, 60);
      doc.text(text, marginL + 10, y + 4.5);
      doc.setDrawColor(230, 235, 240);
      doc.setLineWidth(0.15);
      doc.line(marginL, y + 8, pageW - marginR, y + 8);
      return y + 9;
    };

    // Header
    doc.setFillColor(13, 27, 42);
    doc.rect(0, 0, pageW, 22, "F");

    const finalizePdf = (logoDataUrl: string | null) => {
      if (logoDataUrl) {
        try { doc.addImage(logoDataUrl, "PNG", marginL, 6, 38, 10); } catch (_) {}
      }

      let y = 30;
      drawSectionHeader("Receipt Information", y);
      y += 10;
      y = drawInfoRow("Date", formatReceiptDate(log.createdOn), y);
      y = drawInfoRow("Time", formatReceiptTime(log.createdOn), y);
      y = drawInfoRow(
        "Customer Email",
        String(log.email || log.accountOwnerResponse?.email || "N/A"),
        y
      );
      y += 2;

      drawSectionHeader("Subscription Information", y);
      y += 10;
      y = drawInfoRow("Plan", String(log.planResponse?.name || "N/A"), y);
      const currCode = getCurrencyCode(log.currency);
      const rawAmt = log.paidAmount ?? log.planAmount;
      const numAmt = Number(String(rawAmt || 0).replace(/,/g, ""));
      y = drawAmountRow("Amount Paid", numAmt, currCode, y);
      y = drawInfoRow("Payment Mode", String((log.channel || "N/A").toUpperCase()), y);
      y = drawInfoRow("Duration", "30 days", y);
      y += 2;

      drawSectionHeader("Feature Breakdown", y);
      y += 10;
      const featureItems = buildReceiptFeatures(log.planResponse?.features);
      if (featureItems.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(140, 150, 160);
        doc.text("No specific feature details available for this plan.", marginL + 3, y + 4);
      } else {
        featureItems.forEach((item) => { y = drawFeatureRow(item, y); });
      }

      doc.save(`Receipt_${log.id || "Subscription"}.pdf`);
    };

    let pdfFinalized = false;
    const safeFinalizePdf = (logoDataUrl: string | null) => {
      if (pdfFinalized) return;
      pdfFinalized = true;
      finalizePdf(logoDataUrl);
    };

    const logoImg = new Image();
    logoImg.src = logoSrc;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    logoImg.onload = () => {
      canvas.width = logoImg.naturalWidth;
      canvas.height = logoImg.naturalHeight;
      ctx.drawImage(logoImg, 0, 0);
      try { safeFinalizePdf(canvas.toDataURL("image/png")); } catch (_) { safeFinalizePdf(null); }
    };
    logoImg.onerror = () => safeFinalizePdf(null);
    if (logoImg.complete) {
      canvas.width = logoImg.naturalWidth || 1;
      canvas.height = logoImg.naturalHeight || 1;
      ctx.drawImage(logoImg, 0, 0);
      try { safeFinalizePdf(canvas.toDataURL("image/png")); } catch (_) { safeFinalizePdf(null); }
    }
  };

  // ── Table columns ────────────────────────────────────────────────────────────
  const columns = useMemo<Column[]>(
    () => [
      {
        key: "createdOn",
        label: "Date",
        render: (value) => (
          <span className="text-gray-700 dark:text-gray-200 font-medium">
            {formatDate(value)}
          </span>
        ),
      },
      {
        key: "paidAmount",
        label: "Amount",
        render: (value, row: PlanPaymentHistory) => (
          <span className="font-semibold text-green-600 dark:text-green-400">
            {formatPlanAmount(value ?? row.planAmount, row.currency)}
          </span>
        ),
      },
      {
        key: "channel",
        label: "Medium",
        render: (value) => (
          <span className="text-gray-700 dark:text-gray-200">
            {value || "N/A"}
          </span>
        ),
      },
    ],
    []
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
      <Download size={16} />
      Print Receipt
    </button>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Page title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Client Management
        </h1>

        {/* Back + sub-heading + Export */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Payment History
            </h2>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition"
          >
            <Download size={18} />
            Export
          </button>
        </div>

        {/* Client name */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Client's Name:{" "}
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {clientName}
          </span>
        </p>

        {/* Table */}
        {isLoading && !data ? (
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
            currentPage={page}
            onPageChange={(p) => setPage(p)}
            onPerPageChange={(newSize) => {
              setItemsPerPage(newSize);
              setPage(1);
            }}
            renderActions={renderActions}
            loading={isLoading && !data}
            isUnauthorized={isPermissionDeniedError(error)}
          />
        )}
      </div>
    </div>
  );
};

export default ClientPaymentHistory;
