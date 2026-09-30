import React from "react";

interface PayedEventsHeaderProps {
  totalCount: number;
}

export const PayedEventsHeader: React.FC<PayedEventsHeaderProps> = ({ totalCount }) => {
  return (
    <div className="mb-6 sm:mb-8 flex items-center gap-3">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
        Payed Events
      </h1>
      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm font-medium">
        Total: {totalCount}
      </span>
    </div>
  );
};
