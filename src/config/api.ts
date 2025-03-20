import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const USER_API_URL = import.meta.env.USER_API_URL || "http://localhost:6006";
const CATALOG_API_URL =
  import.meta.env.CATALOG_API_URL || "http://localhost:6009";
const ORDER_API_URL = import.meta.env.ORDER_API_URL || "http://localhost:6003";
const BASKET_API_URL =
  import.meta.env.BASKET_API_URL || "http://localhost:6001";

const createApiInstance = (baseURL: string) => {
  const api = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  api.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return api;
};

export const userApi = createApiInstance(USER_API_URL);
export const catalogApi = createApiInstance(CATALOG_API_URL);
export const orderApi = createApiInstance(ORDER_API_URL);
export const basketApi = createApiInstance(BASKET_API_URL);
