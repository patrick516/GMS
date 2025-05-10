import axios from "axios";
import { toast } from "react-toastify"; // ✅ import toast

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !window.location.pathname.includes("/auth")
    ) {
      // ✅ Show toast before redirect
      toast.error("Session expired. Please log in again.");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Delay redirect slightly so user sees the toast
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }

    return Promise.reject(error);
  }
);

export default API;
