import React from "react";
import type { LucideIcon } from "lucide-react";

interface PlanCardProps {
  icon?: LucideIcon;
  title: string;
  buttonText: string;
  onClick: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  icon: Icon,
  title,
  buttonText,
  onClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-between w-56 h-64 p-6 border rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
      {Icon && (
        <div className="text-blue-600 mb-2">
          <Icon size={36} />
        </div>
      )}

      <h3 className="text-lg font-semibold mb-3 text-center">{title}</h3>

      <button
        onClick={onClick}
        className="px-5 py-2 text-sm font-medium text-blue-600 border border-blue-500 rounded-md hover:bg-blue-50 transition-colors duration-200"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default PlanCard;
