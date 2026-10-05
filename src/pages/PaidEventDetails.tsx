import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Building,
  ShieldCheck,
  ChevronDown,
  FileText,
} from "lucide-react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetEventPaymentRequestsByEventId } from "@/lib/api/EventPaymentEndpoint";
import type { EventPaymentRequest } from "@/lib/schemas";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateTime } from "@/lib/utils/date";
import AppLoader from "@/components/ui/AppLoader";
import { SettlementModal, ReceiptViewer } from "@/components/paid-events";

const PaidEventDetails: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedForSettlement, setSelectedForSettlement] =
    useState<EventPaymentRequest | null>(null);
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null);

  const initialRequest = location.state?.paymentRequest as
    | EventPaymentRequest
    | undefined;

  const {
    data: requestList,
    isLoading,
    isFetching,
    isPlaceholderData,
    error,
  } = useQuery({
    queryKey: ["event-payment-request-details", eventId, page, itemsPerPage],
    queryFn: () =>
      GetEventPaymentRequestsByEventId(eventId!, page - 1, itemsPerPage),
    enabled: !!eventId,
    placeholderData: keepPreviousData,
  });

  const requests = requestList?.content || [];
  const totalCount = requestList?.totalElements ?? requests.length;
  const totalPages =
    requestList?.totalPages != null && requestList.totalPages > 0
      ? requestList.totalPages
      : Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const eventName =
    requests.find((r) => r.eventName)?.eventName ||
    initialRequest?.eventName ||
    "Untitled Event";

  const renderPagination = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const showLoader = isLoading || (isFetching && isPlaceholderData);

  if (isLoading && requests.length === 0 && !initialRequest) {
    return <AppLoader />;
  }

  if (error && requests.length === 0) {
    return (
      <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 font-semibold">
          Error loading payment request details
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 flex items-center justify-center gap-2 hover:underline"
        >
          <ArrowLeft size={20} /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition"
            title="Go back"
          >
            <ArrowLeft size={24} className="text-blue-600" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
              {eventName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Payment Requests ({totalCount})
            </p>
          </div>
        </div>

        {showLoader ? (
          <AppLoader fullScreen={false} />
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              No payment requests found for this event.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {requests.map((req) => {
                const isExpanded = expandedReceiptId === req.id;

                return (
                  <div
                    key={req.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isExpanded
                        ? "bg-white dark:bg-gray-800 border-blue-400/80 dark:border-blue-600 shadow-md ring-2 ring-blue-500/10 dark:ring-blue-400/10"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xs hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                    }`}
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-xs font-mono font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700/60 px-2 py-0.5 rounded">
                              ID: {req.id}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                req.isSettled
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              }`}
                            >
                              {req.isSettled ? (
                                <>
                                  <CheckCircle2 size={12} />
                                  Settled
                                </>
                              ) : (
                                <>
                                  <Clock size={12} className="animate-spin" />
                                  Pending Settlement
                                </>
                              )}
                            </span>
                          </div>

                          <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {formatCurrency(req.amount, req.currency)}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-300 pt-1">
                            <div className="flex items-center gap-2">
                              <Building size={14} className="text-gray-400 shrink-0" />
                              <span className="truncate">
                                {req.bank || "N/A"} •{" "}
                                <span className="font-mono font-medium">
                                  {req.accountNumber || "N/A"}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ShieldCheck
                                size={14}
                                className="text-gray-400 shrink-0"
                              />
                              <span className="truncate">
                                Beneficiary:{" "}
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {req.accountName || "N/A"}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-700/60 shrink-0">
                          {req.receipt && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedReceiptId(
                                  isExpanded ? null : req.id
                                )
                              }
                              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                                isExpanded
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/60"
                              }`}
                            >
                              <FileText size={14} />
                              <span>
                                {isExpanded ? "Hide Receipt" : "View Receipt"}
                              </span>
                              <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          )}

                          {!req.isSettled && (
                            <button
                              type="button"
                              onClick={() => setSelectedForSettlement(req)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition shadow-xs hover:shadow text-center"
                            >
                              Mark as Settled
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                        <span>Requested: {formatDateTime(req.createdOn)}</span>
                        {req.isSettled && (
                          <div className="flex items-center gap-2">
                            {req.settledByName && (
                              <span>
                                Settled by:{" "}
                                <strong className="font-semibold text-gray-700 dark:text-gray-200">
                                  {req.settledByName}
                                </strong>
                              </span>
                            )}
                            {req.updatedOn && (
                              <span>• {formatDateTime(req.updatedOn)}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {isExpanded && req.receipt && (
                      <div className="border-t border-blue-100 dark:border-blue-950/60 bg-blue-50/20 dark:bg-blue-950/10 p-4 sm:p-6 transition-all duration-300 animate-in fade-in">
                        <div className="max-w-2xl mx-auto">
                          <ReceiptViewer
                            receipt={req.receipt}
                            accountName={req.accountName}
                            bank={req.bank}
                            accountNumber={req.accountNumber}
                            amount={formatCurrency(req.amount, req.currency)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Showing {(page - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(page * itemsPerPage, totalCount)} of {totalCount}{" "}
                  requests
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {renderPagination().map((p, idx) =>
                      typeof p === "number" ? (
                        <button
                          key={idx}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                            page === p
                              ? "bg-blue-600 text-white"
                              : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          {p}
                        </button>
                      ) : (
                        <span
                          key={idx}
                          className="px-1 text-xs text-gray-400 dark:text-gray-500"
                        >
                          {p}
                        </span>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <SettlementModal
        request={selectedForSettlement}
        isOpen={!!selectedForSettlement}
        onClose={() => setSelectedForSettlement(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["event-payment-request-details", eventId],
          });
          queryClient.invalidateQueries({
            queryKey: ["event-payment-requests"],
          });
        }}
      />
    </div>
  );
};

export default PaidEventDetails;
