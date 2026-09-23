import React, { useState } from "react";

interface ReceiptViewerProps {
  receipt?: string | null;
  className?: string;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  receipt,
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  if (!receipt) {
    return (
      <p className={`text-sm text-gray-500 dark:text-gray-400 italic ${className}`}>
        No receipt uploaded.
      </p>
    );
  }

  const isImage =
    !imageError &&
    (/^(https?:\/\/|\/|data:)/i.test(receipt) ||
      /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(receipt));

  if (isImage) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 inline-block max-w-xl shadow-sm">
          <img
            src={receipt}
            alt="Payment Receipt"
            onError={() => setImageError(true)}
            className="max-h-[480px] w-auto rounded-lg object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <p
      className={`text-gray-900 dark:text-white font-medium leading-relaxed whitespace-pre-wrap break-all text-sm ${className}`}
    >
      {receipt}
    </p>
  );
};
