import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { MarkEventPaymentRequestAsSettled } from "@/lib/api/EventPaymentEndpoint";
import type { EventPaymentRequest } from "@/lib/schemas";
import { formatCurrency } from "@/lib/utils/currency";
import { showErrorToast } from "@/lib/utils/toast";

interface SettlementModalProps {
  request: EventPaymentRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [settlementNote, setSettlementNote] = useState("");
  const [error, setError] = useState("");

  const markSettledMutation = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      return await MarkEventPaymentRequestAsSettled(id, text);
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Payment request marked as settled successfully.");
      onSuccess();
      handleClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to mark payment request as settled.";
      showErrorToast(msg);
    },
  });

  const handleClose = () => {
    if (markSettledMutation.isPending) return;
    setSettlementNote("");
    setError("");
    onClose();
  };

  const handleConfirm = () => {
    if (!settlementNote.trim()) {
      setError("Please provide a settlement note or reference.");
      return;
    }
    if (!request) return;

    markSettledMutation.mutate({
      id: request.id,
      text: settlementNote.trim(),
    });
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between px-6 py-4 bg-[#081A30] dark:bg-[#081A30]">
          <h3 className="text-white font-semibold text-lg">
            Mark as Settled?
          </h3>
          <button
            onClick={handleClose}
            disabled={markSettledMutation.isPending}
            className="text-white hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 text-center">
          <p className="text-base text-gray-900 dark:text-gray-100 mb-4">
            Are you sure you want to mark the payment request for{" "}
            <span className="font-semibold">
              "{request.eventName || "this event"}"
            </span>{" "}
            of{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(request.amount, request.currency)}
            </span>{" "}
            as settled?
          </p>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-left text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-300 mb-4 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Beneficiary:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {request.accountName || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Bank & Account:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {request.bank} - {request.accountNumber}
              </span>
            </div>
          </div>

          <div className="text-left mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Settlement Note / Reference <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={settlementNote}
              onChange={(e) => {
                setSettlementNote(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Settled via bank transfer, Ref: TXN-12345"
              className={`w-full rounded-lg border p-2.5 text-sm transition focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                error
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-400 dark:border-gray-600"
              }`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={markSettledMutation.isPending}
              className="px-6 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={markSettledMutation.isPending}
              className="px-6 py-2 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {markSettledMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
