import React from "react";
import { Upload } from "lucide-react";

interface PayedEventsFilterBarProps {
  isSettled: boolean;
  onStatusChange: (isSettled: boolean) => void;
  onExport: () => void;
}

export const PayedEventsFilterBar: React.FC<PayedEventsFilterBarProps> = ({
  isSettled,
  onStatusChange,
  onExport,
}) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <select
          value={isSettled ? "true" : "false"}
          onChange={(e) => onStatusChange(e.target.value === "true")}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="false">Not Settled</option>
          <option value="true">Settled</option>
        </select>
      </div>

      <button
        onClick={onExport}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition"
      >
        <Upload size={15} />
        Export
      </button>
    </div>
  );
};
