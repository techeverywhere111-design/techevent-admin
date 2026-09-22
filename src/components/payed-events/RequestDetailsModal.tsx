import React, { useState } from "react";
import {
  Banknote,
  CheckCircle2,
  Clock,
  Building,
  Copy,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { GetEventPaymentRequestsByEventId } from "@/lib/api/EventPaymentEndpoint";
import type { EventPaymentRequest } from "@/lib/schemas";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateTime } from "@/lib/utils/date";

interface RequestDetailsModalProps {
  eventId: string | null;
  initialData?: EventPaymentRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsSettled?: (req: EventPaymentRequest) => void;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  eventId,
  initialData,
  isOpen,
  onClose,
  onMarkAsSettled,
}) => {
  const [copied, setCopied] = useState(false);

  const { data: requestDetails, isLoading } = useQuery({
    queryKey: ["event-payment-request-details", eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const res = await GetEventPaymentRequestsByEventId(eventId, 0, 10);
      return res.content?.[0] || null;
    },
    enabled: isOpen && !!eventId,
  });

  const request = requestDetails || initialData;

  if (!isOpen || !eventId) return null;

  const handleCopyAccount = () => {
    if (!request?.accountNumber) return;
    navigator.clipboard.writeText(request.accountNumber);
    setCopied(true);
    toast.info("Account number copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#0B1E36] px-6 py-4 text-white dark:border-gray-700">
          <div className="flex items-center gap-2.5">
            <Banknote className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold">Payment Request Details</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading && !request ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Fetching request details...
            </p>
          </div>
        ) : request ? (
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div
              className={`flex items-center justify-between rounded-xl p-4 ${
                request.isSettled
                  ? "bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300"
                  : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {request.isSettled ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                )}
                <span className="font-semibold text-sm">
                  Status: {request.isSettled ? "Settled" : "Not Settled"}
                </span>
              </div>
              <span className="text-lg font-bold">
                {formatCurrency(request.amount, request.currency)}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                Event Details
              </h4>
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-sm dark:border-gray-700 dark:bg-gray-700/40 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Event Name:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {request.eventName || "Untitled Event"}
                  </span>
                </div>
                {request.accountId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Account ID:</span>
                    <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                      {request.accountId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                Beneficiary Payout Account
              </h4>
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-sm dark:border-gray-700 dark:bg-gray-700/40 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Account Name:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {request.accountName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Bank:</span>
                  <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white">
                    <Building size={14} className="text-blue-500" />
                    <span>{request.bank || "N/A"}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {request.accountNumber || "N/A"}
                    </span>
                    <button
                      onClick={handleCopyAccount}
                      title="Copy account number"
                      className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {request.isSettled && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                  Settlement Information
                </h4>
                <div className="rounded-xl border border-green-100 bg-green-50/40 p-4 text-sm dark:border-green-900/40 dark:bg-green-950/20 space-y-2">
                  {request.settledByName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Settled By:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {request.settledByName}
                      </span>
                    </div>
                  )}
                  {request.updatedOn && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Settled Date:</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {formatDateTime(request.updatedOn)}
                      </span>
                    </div>
                  )}
                  {request.receipt && (
                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-gray-500 dark:text-gray-400">Receipt / Notes:</span>
                      <p className="rounded-lg bg-white/70 p-2.5 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        {request.receipt}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
              <span>Requested On: {formatDateTime(request.createdOn)}</span>
              <span className="font-mono">ID: {request.id}</span>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Close
              </button>
              {!request.isSettled && onMarkAsSettled && (
                <button
                  onClick={() => {
                    onClose();
                    onMarkAsSettled(request);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  <CheckCircle2 size={16} />
                  Mark as Settled
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
