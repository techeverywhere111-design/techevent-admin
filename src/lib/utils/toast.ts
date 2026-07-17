import { toast, type ToastOptions } from "react-toastify";

const recentErrorMessages = new Map<string, number>();

export const showErrorToast = (
  message: string,
  options?: ToastOptions
) => {
  const normalizedMessage = message || "Something went wrong.";
  const toastId = `error:${normalizedMessage}`;
  const now = Date.now();
  const lastShownAt = recentErrorMessages.get(toastId) || 0;

  if (now - lastShownAt < 2500 || toast.isActive(toastId)) return;

  recentErrorMessages.set(toastId, now);
  toast.error(normalizedMessage, {
    toastId,
    ...options,
  });
};
