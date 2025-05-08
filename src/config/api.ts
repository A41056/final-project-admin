import { FileType, UploadFileResponse } from "@/services/mediaServices";
import { useAuthStore } from "@/stores/authStore";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "react-query";

export const USER_API_URL =
  import.meta.env.USER_API_URL || "http://localhost:6006";
export const CATALOG_API_URL =
  import.meta.env.CATALOG_API_URL || "http://localhost:6009";
export const ORDER_API_URL =
  import.meta.env.ORDER_API_URL || "http://localhost:6003";
export const BASKET_API_URL =
  import.meta.env.BASKET_API_URL || "http://localhost:6001";
export const MEDIA_API_URL =
  import.meta.env.MEDIA_API_URL || "http://localhost:6010";

export const handleApiError = (response: Response) => {
  if (response.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = "/login";
  }
  throw new Error(`API error: ${response.status} - ${response.statusText}`);
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) handleApiError(response);
  return response.json();
};

export const fetchFormDataWithAuth = async (
  url: string,
  formData: FormData
) => {
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

  if (!response.ok) handleApiError(response);
  return response.json();
};

export const deleteWithAuth = async (url: string) => {
  const token = useAuthStore.getState().token;
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) handleApiError(response);
  return response.json();
};

// User API
export const userApi = {
  useGet: (endpoint: string) =>
    useQuery({
      queryKey: ["user", endpoint],
      queryFn: () => fetchWithAuth(`${USER_API_URL}${endpoint}`),
    }),

  usePost: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ endpoint, data }: { endpoint: string; data: any }) =>
        fetchWithAuth(`${USER_API_URL}${endpoint}`, {
          method: "POST",
          body: JSON.stringify(data),
        }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
    });
  },

  usePut: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ endpoint, data }: { endpoint: string; data: any }) =>
        fetchWithAuth(`${USER_API_URL}${endpoint}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (endpoint: string) =>
        fetchWithAuth(`${USER_API_URL}${endpoint}`, {
          method: "DELETE",
        }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
    });
  },

  useLogin: () =>
    useMutation({
      mutationFn: ({ email, password }: { email: string; password: string }) =>
        fetchWithAuth(`${USER_API_URL}/login`, {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }),
    }),
};

// Catalog API
export const catalogApi = {
  useGet: (
    endpoint: string,
    params?: Record<string, any>,
    options?: Partial<UseQueryOptions<any, unknown, any>>
  ) =>
    useQuery({
      queryKey: ["catalog", endpoint, params],
      queryFn: () => {
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
      ...options,
    }),

  usePost: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ endpoint, data }: { endpoint: string; data: any }) =>
        fetchWithAuth(`${CATALOG_API_URL}${endpoint}`, {
          method: "POST",
          body: JSON.stringify(data),
        }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
    });
  },

  usePut: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ endpoint, data }: { endpoint: string; data: any }) =>
        fetchWithAuth(`${CATALOG_API_URL}${endpoint}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (endpoint: string) =>
        fetchWithAuth(`${CATALOG_API_URL}${endpoint}`, {
          method: "DELETE",
        }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
    });
  },
};

// Order API
export const orderApi = {
  useGet: (endpoint: string) =>
    useQuery({
      queryKey: ["order", endpoint],
      queryFn: () => fetchWithAuth(`${ORDER_API_URL}${endpoint}`),
    }),

  usePost: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ endpoint, data }: { endpoint: string; data: any }) =>
        fetchWithAuth(`${ORDER_API_URL}${endpoint}`, {
          method: "POST",
          body: JSON.stringify(data),
        }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["order"] }),
    });
  },

  usePut: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ endpoint, data }: { endpoint: string; data: any }) =>
        fetchWithAuth(`${ORDER_API_URL}${endpoint}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["order"] }),
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (endpoint: string) =>
        fetchWithAuth(`${ORDER_API_URL}${endpoint}`, {
          method: "DELETE",
        }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["order"] }),
    });
  },
};

// Basket API
export const basketApi = {
  useGet: (endpoint: string) =>
    useQuery({
      queryKey: ["basket", endpoint],
      queryFn: () => fetchWithAuth(`${BASKET_API_URL}${endpoint}`),
    }),

  usePost: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ endpoint, data }: { endpoint: string; data: any }) =>
        fetchWithAuth(`${BASKET_API_URL}${endpoint}`, {
          method: "POST",
          body: JSON.stringify(data),
        }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["basket"] }),
    });
  },

  usePut: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ endpoint, data }: { endpoint: string; data: any }) =>
        fetchWithAuth(`${BASKET_API_URL}${endpoint}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["basket"] }),
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (endpoint: string) =>
        fetchWithAuth(`${BASKET_API_URL}${endpoint}`, {
          method: "DELETE",
        }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["basket"] }),
    });
  },
};

// Media API
export const mediaApi = {
  useGetFileTypes: (endpoint: string) =>
    useQuery<FileType[], Error>({
      queryKey: ["media", endpoint],
      queryFn: () => fetchWithAuth(`${MEDIA_API_URL}${endpoint}`),
    }),

  useUploadFile: () => {
    const queryClient = useQueryClient();
    return useMutation<UploadFileResponse, Error, FormData>({
      mutationFn: (formData: FormData) =>
        fetchFormDataWithAuth(`${MEDIA_API_URL}/files`, formData),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["media"] }),
    });
  },

  useDeleteFile: () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
      mutationFn: (fileName: string) =>
        deleteWithAuth(`${MEDIA_API_URL}/files/${fileName}`),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["media"] }),
    });
  },
};
