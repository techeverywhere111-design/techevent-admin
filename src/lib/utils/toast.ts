import { toast, type ToastOptions } from "react-toastify";

const recentErrorMessages = new Map<string, number>();

export const showErrorToast = (
  message: string,
  options?: ToastOptions
) => {
  const normalizedMessage = message || "Something went wrong.";
  const messageKey = `error:${normalizedMessage}`;
  const toastId = options?.toastId || `error:${normalizedMessage}`;
  const now = Date.now();
  const lastShownAt = Math.max(
    recentErrorMessages.get(messageKey) || 0,
    recentErrorMessages.get(String(toastId)) || 0
  );

  if (now - lastShownAt < 2500 || toast.isActive(toastId)) return;

  recentErrorMessages.set(messageKey, now);
  recentErrorMessages.set(String(toastId), now);
  toast.error(normalizedMessage, {
    ...options,
    toastId,
  });
};
