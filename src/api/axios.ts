import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const api = axios.create({
  baseURL: apiBase,
});

/** Base URL for static assets (uploads). Uploads are served at /uploads, not under /api. */
export const serverBaseUrl =
  (typeof apiBase === "string" ? apiBase.replace(/\/api\/?$/, "") : "http://localhost:3000") ||
  "http://localhost:3000";

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;