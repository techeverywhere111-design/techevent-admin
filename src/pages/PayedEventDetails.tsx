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
import { SettlementModal, ReceiptViewer } from "@/components/payed-events";

const PayedEventDetails: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
                          {/* Beneficiary */}
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                              Beneficiary
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white truncate text-base">
                              {req.accountName || "N/A"}
                            </p>
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1.5 rounded-md bg-gray-100 dark:bg-gray-700/60 text-xs text-gray-600 dark:text-gray-300 font-mono">
                              <Building size={11} className="text-blue-500 shrink-0" />
                              <span className="font-medium truncate max-w-[100px]">
                                {req.bank}
                              </span>
                              <span className="text-gray-400 dark:text-gray-500">•</span>
                              <span>{req.accountNumber}</span>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                              Amount
                            </p>
                            <p className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                              {formatCurrency(req.amount, req.currency)}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {req.currency || "NGN"}
                            </p>
                          </div>

                          {/* Status */}
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                              Status
                            </p>
                            <div>
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  req.isSettled
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40"
                                    : "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    req.isSettled
                                      ? "bg-emerald-500"
                                      : "bg-amber-500 animate-pulse"
                                  }`}
                                />
                                {req.isSettled ? "Settled" : "Not Settled"}
                              </span>
                            </div>
                            {req.isSettled && (req.settledByName || req.settledBy) && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 truncate">
                                by{" "}
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {req.settledByName || req.settledBy}
                                </span>
                              </p>
                            )}
                          </div>

                          {/* Date */}
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                              Date Requested
                            </p>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {formatDateTime(req.createdOn)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
                          {req.receipt && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedReceiptId(
                                  isExpanded ? null : req.id
                                )
                              }
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition shadow-2xs ${
                                isExpanded
                                  ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-750"
                              }`}
                            >
                              <FileText
                                size={14}
                                className={
                                  isExpanded
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-400"
                                }
                              />
                              <span>
                                {isExpanded ? "Hide Receipt" : "View Receipt"}
                              </span>
                              <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 ${
                                  isExpanded
                                    ? "rotate-180 text-blue-600 dark:text-blue-400"
                                    : "text-gray-400"
                                }`}
                              />
                            </button>
                          )}
                          {!req.isSettled && (
                            <button
                              type="button"
                              onClick={() => setSelectedForSettlement(req)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition shadow-sm"
                            >
                              <CheckCircle2 size={14} />
                              <span>Mark as Settled</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Drawer Area */}
                    {isExpanded && req.receipt && (
                      <div className="border-t border-gray-200/80 dark:border-gray-700/80 bg-slate-50/60 dark:bg-gray-900/40 p-5 sm:p-6 transition-all">
                        <div className="max-w-2xl mx-auto space-y-4">
                          {/* Settlement Audit Info */}
                          {req.isSettled && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/70 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/25">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400">
                                  <ShieldCheck size={18} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      Settled by
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {req.settledByName || req.settledBy || "Admin"}
                                    </span>
                                  </div>
                                  {req.updatedOn && (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      <Clock size={11} />
                                      <span>
                                        {formatDateTime(req.updatedOn)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                                <CheckCircle2 size={12} />
                                Verified Settlement
                              </span>
                            </div>
                          )}

                          {/* Sleek Receipt Document Frame */}
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

            {/* Pagination Footer */}
            {requests.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="px-3 py-1 rounded text-sm bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-300">
                  {page} of {totalPages}
                </span>

                <div className="flex gap-2 flex-wrap justify-center">
                  {totalPages > 1 &&
                    renderPagination().map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => typeof p === "number" && setPage(p)}
                        disabled={p === "..."}
                        className={`min-w-[40px] px-3 py-1 rounded text-sm transition ${
                          p === page
                            ? "bg-blue-600 text-white"
                            : p === "..."
                            ? "text-gray-400 dark:text-gray-500 cursor-default bg-transparent"
                            : "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-gray-600"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Per page:
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
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

export default PayedEventDetails;
