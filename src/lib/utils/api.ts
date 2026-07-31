import axios from "axios";
import Cookies from "js-cookie";
import { showErrorToast } from "@/lib/utils/toast";

const customCookies = Cookies.withConverter({
  write: (value) => value,
  read: (value) => value,
});

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

const cookieConfig = {
  expires: 7,
  secure: window.location.protocol === "https:",
  sameSite: "Strict" as const,
  path: "/",
};

export const isPermissionDeniedMessage = (message: string) =>
  /permission|not authorized|not authorised|access denied/i.test(message);

export const isSessionExpiredMessage = (message: string) =>
  /session|token|jwt|expired|invalid|login/i.test(message) &&
  !isPermissionDeniedMessage(message);

export const isPermissionDeniedError = (error: any): boolean => {
  if (!error) return false;
  const status = error.response?.status;
  const message = error.response?.data?.message || error.message || "";
  
  if (status === 403) return true;
  if (status === 401 && !isSessionExpiredMessage(message)) return true;
  if (isPermissionDeniedMessage(message)) return true;
  return false;
};

api.interceptors.request.use((config) => {
  const token = customCookies.get("PLUTO_EVENT_ADMIN_TOKEN");
  if (token && config.headers) {
    config.headers["x-token-ch"] = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const token = response.headers["x-token-ch"];
    if (token) {
      customCookies.set("PLUTO_EVENT_ADMIN_TOKEN", token, cookieConfig);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      (status === 401 || status === 403
        ? "You don't have permission to perform this action."
        : "");
    const requestUrl = error.config?.url || "";
    const isLoginRequest = requestUrl.includes("/api/v1/admin-users/login");

    if (status === 401 && isLoginRequest) {
      return Promise.reject(error);
    }

    if (status === 401 && isSessionExpiredMessage(message)) {
      customCookies.remove("PLUTO_EVENT_ADMIN_TOKEN", { path: "/" });
      customCookies.remove("PLUTO_EVENT_ADMIN_USER", { path: "/" });

      showErrorToast(message || "Session expired. Please login again.", {
        toastId: "session-expired",
      });

      setTimeout(() => {
        window.location.replace("/");
      }, 2000);

      return Promise.reject(error);
    }

    if (status === 401 || status === 403 || isPermissionDeniedError(error)) {
      const isGetMethod = (error.config?.method || "get").toLowerCase() === "get";
      const forceToast =
        error.config?.headers?.["x-show-error-toast"] === "true" ||
        error.config?.headers?.["x-show-error-toast"] === true;
      const skipToast =
        error.config?.headers?.["x-skip-error-toast"] === "true" ||
        error.config?.headers?.["x-skip-error-toast"] === true;

      // Data fetching (GET) requests do not show error toasts by default (since inline table/card UI handles it).
      // Action requests (POST, PUT, DELETE, etc.) do show error toasts unless explicitly skipped.
      if (!skipToast && (!isGetMethod || forceToast)) {
        showErrorToast(message);
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
