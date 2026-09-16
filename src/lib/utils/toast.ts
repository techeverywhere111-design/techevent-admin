import { toast, type ToastOptions } from "react-toastify";

const recentErrorMessages = new Map<string, number>();

export const showErrorToast = (
  errorOrMessage: any,
  fallbackOrOptions?: string | ToastOptions,
  options?: ToastOptions
) => {
  let message = "";
  let finalOptions: ToastOptions | undefined;

  if (typeof errorOrMessage === "string") {
    message = errorOrMessage;
    if (typeof fallbackOrOptions === "object") {
      finalOptions = fallbackOrOptions;
    } else {
      finalOptions = options;
    }
  } else if (errorOrMessage && typeof errorOrMessage === "object") {
    message =
      errorOrMessage.response?.data?.message ||
      errorOrMessage.message ||
      (typeof fallbackOrOptions === "string" ? fallbackOrOptions : "");
    if (typeof fallbackOrOptions === "object") {
      finalOptions = fallbackOrOptions;
    } else {
      finalOptions = options;
    }
  }

  const normalizedMessage =
    typeof message === "string" && message.trim()
      ? message
      : typeof fallbackOrOptions === "string" && fallbackOrOptions.trim()
        ? fallbackOrOptions
        : "Something went wrong.";

  const messageKey = `error:${normalizedMessage}`;
  const toastId = finalOptions?.toastId || `error:${normalizedMessage}`;
  const now = Date.now();
  const lastShownAt = Math.max(
    recentErrorMessages.get(messageKey) || 0,
    recentErrorMessages.get(String(toastId)) || 0
  );

  if (now - lastShownAt < 2500 || toast.isActive(toastId)) return;

  recentErrorMessages.set(messageKey, now);
  recentErrorMessages.set(String(toastId), now);
  toast.error(normalizedMessage, {
    ...finalOptions,
    toastId,
  });
};
