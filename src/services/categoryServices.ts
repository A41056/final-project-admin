import { catalogApi } from "@/config/api";
import {
  Category,
  GetCategoriesRequest,
  GetCategoriesResponse,
} from "@/types/category";

export const getCategories = async ({
  pageNumber,
  pageSize,
}: GetCategoriesRequest): Promise<GetCategoriesResponse> => {
  const response = await catalogApi.get("/categories", {
    params: {
      pageNumber,
      pageSize,
    },
  });
  return response.data;
};

export const createCategory = async (
  category: Omit<Category, "id" | "created" | "modified">
): Promise<Category> => {
  const response = await catalogApi.post("/categories", category);
  return response.data;
};

export const updateCategory = async (
  id: string,
  category: Partial<Category>
): Promise<Category> => {
  const response = await catalogApi.put(`/categories/${id}`, category);
  return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await catalogApi.delete(`/categories/${id}`);
};
