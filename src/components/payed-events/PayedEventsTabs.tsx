import React from "react";
import { CheckCircle2, Clock } from "lucide-react";

interface PayedEventsTabsProps {
  activeTab: "pending" | "settled";
  onTabChange: (tab: "pending" | "settled") => void;
}

export const PayedEventsTabs: React.FC<PayedEventsTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
      <button
        onClick={() => onTabChange("pending")}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
          activeTab === "pending"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        }`}
      >
        <Clock size={16} />
        Pending Settlement
      </button>

      <button
        onClick={() => onTabChange("settled")}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
          activeTab === "settled"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        }`}
      >
        <CheckCircle2 size={16} />
        Settled
      </button>
    </div>
  );
};
