import { catalogApi } from "@/config/api";
import {
  Product,
  CreateProductRequest,
  CreateProductResponse,
  GetProductsRequest,
  GetProductsResponse,
} from "@/types/product";

export const getProductsQuery = (params: GetProductsRequest) => ({
  queryKey: ["products", params],
  queryFn: () =>
    catalogApi.get("/products", {
      pageNumber: params.pageNumber ?? 1,
      pageSize: params.pageSize ?? 10,
      search: params.search,
      categoryIds: params.categoryIds,
      isHot: params.isHot,
      isActive: params.isActive,
      createdFrom: params.createdFrom,
      createdTo: params.createdTo,
    }) as Promise<GetProductsResponse>,
});

export const createProductMutation = () => ({
  mutationFn: (data: CreateProductRequest) =>
    catalogApi.post("/products", data) as Promise<CreateProductResponse>,
});

export const updateProductMutation = () => ({
  mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
    catalogApi.put(`/products/${id}`, data) as Promise<Product>,
});

export const deleteProductMutation = () => ({
  mutationFn: (id: string) =>
    catalogApi.delete(`/products/${id}`) as Promise<void>,
});
