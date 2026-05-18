import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { queryClient } from "@/lib/react-query";

// Configure Cookies to NOT encode characters like + and / which are common in your tokens
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
      // Use customCookies to set the token without encoding
      customCookies.set("PLUTO_EVENT_ADMIN_TOKEN", token, cookieConfig);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 403) {
      // Permission was revoked — refetch permissions to update UI
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });

      const message = error.response.data?.message || "You don't have permission to perform this action.";
      if (!toast.isActive("permission-denied")) {
        toast.error(message, { toastId: "permission-denied" });
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      const message = error.response.data?.message || "Session expired. Please login again.";

      customCookies.remove("PLUTO_EVENT_ADMIN_TOKEN", { path: "/" });
      customCookies.remove("PLUTO_EVENT_ADMIN_USER", { path: "/" });

      if (!toast.isActive("session-expired")) {
        toast.error(message, { toastId: "session-expired" });
      }

      setTimeout(() => {
        window.location.replace("/");
      }, 2000);
    }
    return Promise.reject(error);
  }
);

export default api;

