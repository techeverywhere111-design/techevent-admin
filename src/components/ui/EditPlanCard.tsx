import React from "react";
import { useNavigate } from "react-router-dom";

interface PlanCardProps {
  icon: React.ReactNode;
  type?: string;
  title: string;
  priceNaira: string;
  priceUSD: string;
  features: string[];
  buttonText: string;
  navigateTo?: string;
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
    if (navigateTo) {
      navigate(navigateTo);
    }
  };

  return (
    <div className="border border-blue-300 dark:border-blue-500 rounded-2xl bg-white dark:bg-[#0B1739] text-center w-full max-w-lg p-8 shadow-sm hover:shadow-lg transition-all duration-200">
      <div className="flex justify-center mb-6">{icon}</div>
      <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
        {type}
      </h2>
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
        {title}
      </h2>

      <div className="mb-8 text-gray-700 dark:text-gray-300 text-start">
        <p className="font-medium text-lg mb-2">Price</p>
        <p className="text-base">
          Naira:{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            ₦{priceNaira}
          </span>
        </p>
        <p className="text-base">
          US Dollar:{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            ${priceUSD}
          </span>
        </p>
      </div>

      <div className="text-left mb-10">
        <p className="font-medium text-lg mb-3 text-gray-900 dark:text-white">
          Features
        </p>
        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-green-500 font-bold text-lg">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleClick}
        className="border border-blue-400 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-medium px-8 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default EditPlanCard;
