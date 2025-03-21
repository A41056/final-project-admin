export interface Category {
  id: string;
  name: string;
  created: string;
  modified: string;
  isActive: boolean;
}

export interface CreateCategoryRequest {
  names: string[];
  isActive: boolean;
}

export interface CreateCategoryResponse {
  createdIds: string[];
  duplicates: string[];
}

export interface GetCategoriesResponse {
  categories: Category[];
}

export interface GetCategoriesRequest {
  pageNumber?: number;
  pageSize?: number;
}
