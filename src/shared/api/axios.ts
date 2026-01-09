import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const tokenKey = import.meta.env.VITE_TOKEN_KEY || "auth_token";

const axiosClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

export const axiosPublic = axios.create({
  baseURL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

axiosPublic.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(tokenKey);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(tokenKey);
      delete axiosClient.defaults.headers.common["Authorization"];
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
