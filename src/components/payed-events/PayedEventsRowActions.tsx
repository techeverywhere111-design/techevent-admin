import React from "react";
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
  return (
    <div className="py-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(row);
        }}
        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition"
      >
        View Details
      </button>

      {!row.isSettled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsSettled(row);
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-gray-700 transition"
        >
          Mark as Settled
        </button>
      )}
    </div>
  );
};

