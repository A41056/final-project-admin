import { useAuthStore } from "@/stores/authStore";

const USER_API_URL = import.meta.env.USER_API_URL || "http://localhost:6006";
const CATALOG_API_URL =
  import.meta.env.CATALOG_API_URL || "http://localhost:6009";
const ORDER_API_URL = import.meta.env.ORDER_API_URL || "http://localhost:6003";
const BASKET_API_URL =
  import.meta.env.BASKET_API_URL || "http://localhost:6001";
const MEDIA_API_URL = import.meta.env.MEDIA_API_URL || "http://localhost:6010";
const handleApiError = (response: Response) => {
  if (response.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = "/login";
  }
  throw new Error(`API error: ${response.status} - ${response.statusText}`);
};
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    handleApiError(response);
  }

  return response.json();
};
const fetchFormDataWithAuth = async (url: string, formData: FormData) => {
  const token = useAuthStore.getState().token;
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    headers,
  });

  if (!response.ok) {
    handleApiError(response);
  }

  return response.json();
};

export const userApi = {
  get: (endpoint: string) => fetchWithAuth(`${USER_API_URL}${endpoint}`),
  post: (endpoint: string, data: any) =>
    fetchWithAuth(`${USER_API_URL}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  put: (endpoint: string, data: any) =>
    fetchWithAuth(`${USER_API_URL}${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (endpoint: string) =>
    fetchWithAuth(`${USER_API_URL}${endpoint}`, {
      method: "DELETE",
    }),
};

export const catalogApi = {
  get: (endpoint: string, params?: Record<string, any>) => {
    const url = new URL(`${CATALOG_API_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => url.searchParams.append(key, item));
        } else if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    return fetchWithAuth(url.toString());
  },
  post: (endpoint: string, data: any) =>
    fetchWithAuth(`${CATALOG_API_URL}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  put: (endpoint: string, data: any) =>
    fetchWithAuth(`${CATALOG_API_URL}${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (endpoint: string) =>
    fetchWithAuth(`${CATALOG_API_URL}${endpoint}`, {
      method: "DELETE",
    }),
};

export const orderApi = {
  get: (endpoint: string) => fetchWithAuth(`${ORDER_API_URL}${endpoint}`),
  post: (endpoint: string, data: any) =>
    fetchWithAuth(`${ORDER_API_URL}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  put: (endpoint: string, data: any) =>
    fetchWithAuth(`${ORDER_API_URL}${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (endpoint: string) =>
    fetchWithAuth(`${ORDER_API_URL}${endpoint}`, {
      method: "DELETE",
    }),
};

export const basketApi = {
  get: (endpoint: string) => fetchWithAuth(`${BASKET_API_URL}${endpoint}`),
  post: (endpoint: string, data: any) =>
    fetchWithAuth(`${BASKET_API_URL}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  put: (endpoint: string, data: any) =>
    fetchWithAuth(`${BASKET_API_URL}${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (endpoint: string) =>
    fetchWithAuth(`${BASKET_API_URL}${endpoint}`, {
      method: "DELETE",
    }),
};

export const mediaApi = {
  uploadFile: (formData: FormData) =>
    fetchFormDataWithAuth(`${MEDIA_API_URL}/files`, formData),
};
