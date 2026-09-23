import React, { useState, useRef, useEffect } from "react";
import { Loader2, Upload, Image as ImageIcon, Trash2, CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { MarkEventPaymentRequestAsSettled } from "@/lib/api/EventPaymentEndpoint";
import { UploadMedia, extractMediaUrl } from "@/lib/api/MediaEndpoint";
import type { EventPaymentRequest } from "@/lib/schemas";
import { formatCurrency } from "@/lib/utils/currency";
import { showErrorToast } from "@/lib/utils/toast";
import { useAuth } from "@/context/AuthContext";

interface SettlementModalProps {
  request: EventPaymentRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const markSettledMutation = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      return await MarkEventPaymentRequestAsSettled(id, text);
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Payment request marked as settled successfully.");
      onSuccess();
      handleClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to mark payment request as settled.";
      showErrorToast(msg);
      setIsUploading(false);
    },
  });

  const handleClose = () => {
    if (isUploading || markSettledMutation.isPending) return;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setReceiptFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
    setError("");
    onClose();
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, WEBP).");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setReceiptFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
    setUploadProgress(0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setReceiptFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirm = async () => {
    if (!receiptFile) {
      setError("Please upload a receipt image before confirming.");
      return;
    }
    if (!request) return;

    try {
      setIsUploading(true);
      setError("");
      setUploadProgress(0);

      const targetAccountId =
        request.accountId || user?.id || request.eventId || "admin";

      const uploadResponse = await UploadMedia(
        receiptFile,
        targetAccountId,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      const receiptUrl = extractMediaUrl(uploadResponse);

      if (!receiptUrl) {
        throw new Error("Could not extract receipt URL from upload response.");
      }

      markSettledMutation.mutate({
        id: request.id,
        text: receiptUrl,
      });
    } catch (err: any) {
      setIsUploading(false);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to upload receipt image."
      );
    }
  };

  if (!isOpen || !request) return null;

  const isBusy = isUploading || markSettledMutation.isPending;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="flex items-center justify-between px-6 py-4 bg-[#081A30] dark:bg-[#081A30]">
          <h3 className="text-white font-semibold text-lg">
            Mark as Settled
          </h3>
          <button
            onClick={handleClose}
            disabled={isBusy}
            className="text-white/80 hover:text-white text-2xl leading-none transition"
          >
            ×
          </button>
        </div>

        <div className="p-6 text-center">
          <p className="text-base text-gray-900 dark:text-gray-100 mb-4">
            Mark payment request for{" "}
            <span className="font-semibold">
              "{request.eventName || "this event"}"
            </span>{" "}
            of{" "}
            <span className="font-bold text-green-600 dark:text-green-400">
              {formatCurrency(request.amount, request.currency)}
            </span>{" "}
            as settled.
          </p>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-left text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-300 mb-4 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Beneficiary:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {request.accountName || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Bank & Account:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {request.bank} - {request.accountNumber}
              </span>
            </div>
          </div>

          <div className="text-left mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
              Payment Receipt <span className="text-red-500">* (Image Only)</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isBusy}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {!receiptFile ? (
              <div
                onClick={() => !isBusy && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                    : error
                    ? "border-red-400 bg-red-50/30 dark:bg-red-900/10"
                    : "border-gray-300 hover:border-blue-400 bg-gray-50/50 hover:bg-blue-50/30 dark:border-gray-600 dark:bg-gray-700/30 dark:hover:bg-gray-700/50"
                }`}
              >
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400 mb-2">
                  <Upload size={22} />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Click to upload or drag & drop receipt
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Supported formats: PNG, JPG, JPEG, WEBP
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 dark:border-gray-700 dark:bg-gray-700/50">
                <div className="flex items-center gap-3">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Receipt Preview"
                      className="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-gray-600 bg-white"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <ImageIcon size={24} className="text-gray-500" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {receiptFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(receiptFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>

                  {!isBusy && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      title="Remove image"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {isUploading && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                      <span>Uploading receipt image...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isBusy}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isBusy || !receiptFile}
              className="px-6 py-2 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isBusy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isUploading ? "Uploading..." : "Settling..."}
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Confirm & Settle
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
