import React from "react";
import SkeletonLoader from "./SkeletonLoader";

interface StatCardProps {
  title: string;
  value: string | number;
  loading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, loading }) => {
  return (
    <div className="p-4 bg-white dark:bg-[#0B1120] rounded-2xl shadow-md transition-colors duration-300">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </h3>
      {loading ? (
        <SkeletonLoader height="h-8" width="w-1/2" />
      ) : (
        <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-2">
          {value}
        </p>
      )}
    </div>
  );
};

export default StatCard;
