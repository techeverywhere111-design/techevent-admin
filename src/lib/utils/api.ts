import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

console.log(import.meta.env.VITE_API_BASE_URL);
// Token placeholder (not used yet)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("plutospace_token");
  if (token && config.headers) {
    // Future placeholder for Authorization
    // config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
