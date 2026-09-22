import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, Copy, Building } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { GetEventPaymentRequestsByEventId } from "@/lib/api/EventPaymentEndpoint";
import type { EventPaymentRequest } from "@/lib/schemas";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateTime } from "@/lib/utils/date";
import AppLoader from "@/components/ui/AppLoader";
import { SettlementModal } from "@/components/payed-events";

const PayedEventDetails: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const initialRequest = location.state?.paymentRequest as
    | EventPaymentRequest
    | undefined;

  const { data: requestList, isLoading, error } = useQuery({
    queryKey: ["event-payment-request-details", eventId],
    queryFn: () => GetEventPaymentRequestsByEventId(eventId!, 0, 10),
    enabled: !!eventId,
  });

  const request = requestList?.content?.[0] || initialRequest;

  if (isLoading && !request) {
    return <AppLoader />;
  }

  if (error || !request) {
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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
          Payed Events
        </h1>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition"
            >
              <ArrowLeft size={24} className="text-blue-600" />
            </button>
            <h2 className="text-lg font-medium text-[#1F2937] dark:text-white">
              View
            </h2>
          </div>

          {!request.isSettled && (
            <button
              onClick={() => setIsSettlementModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition shadow-sm"
            >
              <CheckCircle2 size={16} />
              Mark as Settled
            </button>
          )}
        </div>

        <div className="bg-[#F3F7FA] dark:bg-gray-800 p-6 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 min-w-0 overflow-hidden">
          <div className="min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Event Name
            </p>
            <p className="font-semibold text-gray-900 dark:text-white break-words">
              {request.eventName || "Untitled Event"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Amount Requested
            </p>
            <p className="font-bold text-base text-gray-900 dark:text-white">
              {formatCurrency(request.amount, request.currency)}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Settlement Status
            </p>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                request.isSettled
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
              }`}
            >
              {request.isSettled ? (
                <CheckCircle2 size={13} className="text-green-600" />
              ) : (
                <Clock size={13} className="text-amber-600" />
              )}
              {request.isSettled ? "Settled" : "Not Settled"}
            </span>
          </div>
        </div>

        <div className="bg-[#F3F7FA] dark:bg-gray-800 p-6 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 min-w-0 overflow-hidden">
          <div className="min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Beneficiary Name
            </p>
            <p className="font-semibold text-gray-900 dark:text-white break-words">
              {request.accountName || "N/A"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Bank
            </p>
            <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
              <Building size={16} className="text-blue-500" />
              <span>{request.bank || "N/A"}</span>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Account Number
            </p>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-gray-900 dark:text-white">
                {request.accountNumber || "N/A"}
              </span>
              <button
                onClick={() =>
                  handleCopy(request.accountNumber, "Account number")
                }
                className="text-gray-400 hover:text-blue-600 transition"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#F3F7FA] dark:bg-gray-800 p-6 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 min-w-0 overflow-hidden">
          <div className="min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Date | Time
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDateTime(request.createdOn)}
            </p>
          </div>

          {request.isSettled && (
            <>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Settled By
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {request.settledByName || request.settledBy || "N/A"}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Settled Date | Time
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDateTime(request.updatedOn)}
                </p>
              </div>
            </>
          )}
        </div>

        {request.receipt && (
          <div className="bg-[#F3F7FA] dark:bg-gray-800 p-6 rounded-xl min-w-0 overflow-hidden">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">
              Receipt / Settlement Notes
            </p>
            <p className="text-gray-900 dark:text-white font-medium leading-relaxed whitespace-pre-wrap break-all">
              {request.receipt}
            </p>
          </div>
        )}
      </div>

      <SettlementModal
        request={request}
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
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
