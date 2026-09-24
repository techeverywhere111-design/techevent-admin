import React, { useState } from "react";
import { ExternalLink, FileText, ZoomIn } from "lucide-react";

interface ReceiptViewerProps {
  receipt?: string | null;
  className?: string;
  accountName?: string | null;
  bank?: string | null;
  accountNumber?: string | null;
  amount?: string;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  receipt,
  className = "",
  accountName,
  bank,
  accountNumber,
  amount,
}) => {
  const [imageError, setImageError] = useState(false);

  if (!receipt) {
    return (
      <div className={`rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center bg-white dark:bg-gray-800 ${className}`}>
        <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          No receipt uploaded for this request.
        </p>
      </div>
    );
  }

  const isImage =
    !imageError &&
    (/^(https?:\/\/|\/|data:)/i.test(receipt) ||
      /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(receipt));

  const handleOpenOriginal = () => {
    window.open(receipt, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xs ${className}`}>
      {/* Document Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50/70 dark:bg-gray-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
            <FileText size={15} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                Proof of Payment
              </span>
              {amount && (
                <span className="hidden sm:inline-block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {amount}
                </span>
              )}
            </div>
            {(accountName || bank || accountNumber) && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {[accountName, bank, accountNumber].filter(Boolean).join(" • ")}
              </p>
            )}
          </div>
        </div>

        {isImage && (
          <button
            type="button"
            onClick={handleOpenOriginal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-750 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition shadow-2xs shrink-0"
            title="Open receipt in a new tab"
          >
            <span>Open Original</span>
            <ExternalLink size={13} />
          </button>
        )}
      </div>

      {/* Document Preview Canvas */}
      {isImage ? (
        <div className="relative group bg-slate-100/80 dark:bg-gray-900/60 p-4 sm:p-6 flex items-center justify-center min-h-[220px]">
          <div
            onClick={handleOpenOriginal}
            className="relative cursor-pointer max-w-full overflow-hidden rounded-lg border border-gray-200/90 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm transition hover:shadow-md hover:border-blue-400/80 dark:hover:border-blue-500/80"
          >
            <img
              src={receipt}
              alt="Payment Receipt"
              onError={() => setImageError(true)}
              className="max-h-[460px] w-auto max-w-full rounded-md object-contain"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-xs font-medium text-white shadow-md">
                <ZoomIn size={13} />
                Click to view full size
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5">
          <p className="text-gray-900 dark:text-white font-mono text-sm leading-relaxed whitespace-pre-wrap break-all bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            {receipt}
          </p>
        </div>
      )}
    </div>
  );
};
