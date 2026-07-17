import axios from "axios";
import { logger } from "./logger";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url ?? "unknown";
    if (status === 401) {
      logger.warn("Unauthorized — clearing session", { component: "api-client", action: "401 interceptor" });
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");
        window.location.href = "/admin/login";
      }
    } else {
      logger.error(`API error ${status} on ${url}`, { component: "api-client" }, err.response?.data);
    }
    return Promise.reject(err);
  }
);

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "token" && e.newValue === null) {
      localStorage.removeItem("admin");
      window.location.href = "/admin/login";
    }
  });
}

export default apiClient;
