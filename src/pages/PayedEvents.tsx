import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Banknote, Loader2 } from "lucide-react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import Table from "@/components/ui/Table";
import { GetEventPaymentRequests } from "@/lib/api/EventPaymentEndpoint";
import type { EventPaymentRequest } from "@/lib/schemas";
import { isPermissionDeniedError } from "@/lib/utils/api";
import {
  PayedEventsHeader,
  PayedEventsFilterBar,
  PayedEventsRowActions,
  SettlementModal,
  usePayedEventsColumns,
  exportPayedEventsToExcel,
} from "@/components/payed-events";

const PayedEvents: React.FC = () => {
  const navigate = useNavigate();
  const [isSettled, setIsSettled] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedForSettlement, setSelectedForSettlement] =
    useState<EventPaymentRequest | null>(null);

  const queryClient = useQueryClient();
  const columns = usePayedEventsColumns(isSettled);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["event-payment-requests", isSettled, page, itemsPerPage],
    queryFn: async () => {
      const response = await GetEventPaymentRequests(
        isSettled,
        page - 1,
        itemsPerPage
      );
      return {
        content: response.content || [],
        totalElements: response.totalElements ?? 0,
      };
    },
    placeholderData: keepPreviousData,
  });

  const paymentRequests = data?.content || [];
  const totalCount = data?.totalElements || 0;

  const handleStatusChange = (status: boolean) => {
    setIsSettled(status);
    setPage(1);
  };

  const handleViewDetails = (row: EventPaymentRequest) => {
    navigate(`/payed-events/${row.eventId}`, {
      state: { paymentRequest: row },
    });
  };

  return (
    <div className="min-h-full w-full min-w-0 bg-gray-50 p-4 transition-colors duration-300 dark:bg-gray-900 sm:p-5">
      <div className="w-full min-w-0 max-w-7xl mx-auto">
        <PayedEventsHeader totalCount={totalCount} />

        <PayedEventsFilterBar
          isSettled={isSettled}
          onStatusChange={handleStatusChange}
          onExport={() => exportPayedEventsToExcel(paymentRequests, isSettled)}
        />

        {isLoading && !data ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Loading payment requests...
            </p>
          </div>
        ) : error && !isPermissionDeniedError(error) ? (
          <div className="rounded-2xl border border-dashed border-red-300 bg-white p-8 text-center dark:border-red-900/50 dark:bg-gray-800">
            <Banknote className="mx-auto mb-3 h-10 w-10 text-red-400" />
            <p className="text-base font-semibold text-red-600 dark:text-red-400">
              Error loading event payment requests
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {(error as Error).message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={paymentRequests}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
            currentPage={page}
            onPageChange={(pageNumber) => setPage(pageNumber)}
            onPerPageChange={(newSize) => {
              setItemsPerPage(newSize);
              setPage(1);
            }}
            renderActions={(row) => (
              <PayedEventsRowActions
                row={row}
                onViewDetails={handleViewDetails}
                onMarkAsSettled={setSelectedForSettlement}
              />
            )}
            loading={isLoading && !data}
            isUnauthorized={isPermissionDeniedError(error)}
          />
        )}
      </div>

      <SettlementModal
        request={selectedForSettlement}
        isOpen={!!selectedForSettlement}
        onClose={() => setSelectedForSettlement(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["event-payment-requests"],
          });
        }}
      />
    </div>
  );
};

export default PayedEvents;
