// src/components/ui/EditPlanCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import type { PlanFeatures } from "@/lib/api/Plans";
import { convertFeaturesToDisplayList } from "@/lib/api/Plans";
import type { DisplayLine } from "@/lib/api/Plans";

interface PlanCardProps {
  id: string;
  icon: React.ReactNode;
  type?: string;
  title: string;
  priceNaira: string;
  priceUSD: string;
  features: PlanFeatures;
  buttonText: string;
  navigateTo?: string;
  isActive: boolean;
}

const EditPlanCard: React.FC<PlanCardProps> = ({
  icon,
  title,
  type,
  priceNaira,
  priceUSD,
  features,
  buttonText,
  navigateTo,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (navigateTo) navigate(navigateTo);
  };

  // Convert features to display lines (Option A)
  const displayLines: DisplayLine[] = convertFeaturesToDisplayList(
    features || {}
  );

  return (
    <div className="border border-blue-300 dark:border-blue-500 rounded-xl bg-white dark:bg-[#0B1739] w-full max-w-md p-6 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Icon */}
      <div className="flex justify-center mb-4">{icon}</div>

      {type && (
        <h2 className="text-sm text-gray-500 mb-0.5 tracking-wide">{type}</h2>
      )}

      {/* Title */}
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {title}
      </h2>

      {/* Price */}
      <div className="mb-6 text-gray-700 dark:text-gray-300 text-start">
        <p className="font-semibold text-base mb-1">Price</p>

        <p className="text-sm">
          Naira:{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            ₦{priceNaira}
          </span>
        </p>

        <p className="text-sm">
          US Dollar:{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            ${priceUSD}
          </span>
        </p>
      </div>

      {/* Features */}
      <div className="text-left mb-8">
        <p className="font-semibold text-base mb-2 text-gray-900 dark:text-white">
          Features
        </p>

        <ul className="space-y-2">
          {displayLines.map((line, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <div className="mt-1">
                {line.isActive ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>

              <span
                className={
                  line.isActive
                    ? "text-gray-900 dark:text-gray-200 text-sm font-medium"
                    : "text-gray-400 dark:text-gray-500 text-sm"
                }
              >
                {line.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Button */}
      <button
        onClick={handleClick}
        className="border border-blue-400 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-medium px-6 py-2.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200 text-sm"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default EditPlanCard;
