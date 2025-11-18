import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("PLUTO_EVENT_ADMIN_TOKEN");
  if (token && config.headers) {
    config.headers["x-token-ch"] = token;
    console.log("📌 TOKEN ATTACHED TO REQUEST (x-token-ch):", token);
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const token = response.headers["x-token-ch"];

    if (token) {
      Cookies.set("PLUTO_EVENT_ADMIN_TOKEN", token, { expires: 7 });
    }

    return response;
  },
  (error) => Promise.reject(error)
);

export default api;
