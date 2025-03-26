import { catalogApi } from "@/config/api";
import {
  Category,
  CreateCategoryRequest,
  CreateCategoryResponse,
  GetCategoriesRequest,
  GetCategoriesResponse,
} from "@/types/category";

export const getCategoriesQuery = (params: GetCategoriesRequest) => ({
  queryKey: ["categories", params],
  queryFn: () =>
    catalogApi.get("/categories", {
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
    }) as Promise<GetCategoriesResponse>,
});

export const createCategoryMutation = () => ({
  mutationFn: (data: CreateCategoryRequest) =>
    catalogApi.post("/categories", data) as Promise<CreateCategoryResponse>,
});

export const updateCategoryMutation = () => ({
  mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
    catalogApi.put(`/categories/${id}`, data) as Promise<Category>,
});

export const deleteCategoryMutation = () => ({
  mutationFn: (id: string) =>
    catalogApi.delete(`/categories/${id}`) as Promise<void>,
});
