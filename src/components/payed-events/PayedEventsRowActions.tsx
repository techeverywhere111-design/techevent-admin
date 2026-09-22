import React from "react";
import { CheckCircle2, Copy, Eye } from "lucide-react";
import { toast } from "react-toastify";
import type { EventPaymentRequest } from "@/lib/schemas";

interface PayedEventsRowActionsProps {
  row: EventPaymentRequest;
  onViewDetails: (row: EventPaymentRequest) => void;
  onMarkAsSettled: (row: EventPaymentRequest) => void;
}

export const PayedEventsRowActions: React.FC<PayedEventsRowActionsProps> = ({
  row,
  onViewDetails,
  onMarkAsSettled,
}) => {
  const handleCopyBankInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${row.accountName} - ${row.bank} - ${row.accountNumber}`
    );
    toast.success("Account details copied to clipboard");
  };

  return (
    <div className="py-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(row);
        }}
        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition"
      >
        <Eye size={15} className="text-blue-500" />
        View Details
      </button>

      <button
        onClick={handleCopyBankInfo}
        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition"
      >
        <Copy size={15} className="text-gray-400" />
        Copy Bank Info
      </button>

      {!row.isSettled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsSettled(row);
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-gray-700 transition"
        >
          <CheckCircle2 size={15} />
          Mark as Settled
        </button>
      )}
    </div>
  );
};
