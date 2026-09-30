import { useMemo } from "react";
import type { Column } from "@/components/ui/Table";
import type { EventPaymentRequest } from "@/lib/schemas";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateTime } from "@/lib/utils/date";

export const usePayedEventsColumns = (isSettled: boolean): Column[] => {
  return useMemo<Column[]>(
    () => [
      {
        key: "eventName",
        label: "Event",
        render: (_, row: EventPaymentRequest) => (
          <span className="font-semibold text-gray-900 dark:text-white">
            {row.eventName || "Untitled Event"}
          </span>
        ),
      },
      {
        key: "accountName",
        label: "Beneficiary Account",
        render: (_, row: EventPaymentRequest) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-white">
              {row.accountName || "N/A"}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span>{row.bank}</span>
              <span>•</span>
              <span className="font-mono font-medium">{row.accountNumber}</span>
            </div>
          </div>
        ),
      },
      {
        key: "amount",
        label: "Amount",
        render: (val, row: EventPaymentRequest) => (
          <span className="font-bold text-gray-900 dark:text-white">
            {formatCurrency(val, row.currency)}
          </span>
        ),
      },
      {
        key: "isSettled",
        label: "Status",
        render: (settled: boolean) => (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              settled
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                settled ? "bg-green-500" : "bg-amber-500 animate-pulse"
              }`}
            />
            {settled ? "Settled" : "Not Settled"}
          </span>
        ),
      },
      ...(isSettled
        ? [
            {
              key: "settledByName",
              label: "Settled By",
              render: (val: any, row: EventPaymentRequest) => (
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {val || row.settledByName || row.settledBy || "N/A"}
                </span>
              ),
            },
          ]
        : []),
      {
        key: "createdOn",
        label: "Date | Time",
        render: (val) => (
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {formatDateTime(val)}
          </span>
        ),
      },
    ],
    [isSettled]
  );
};
