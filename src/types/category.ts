export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  created: string;
  modified: string;
  isActive: boolean;
}

export interface CreateCategoryRequest {
  names: string;
  isActive: boolean;
  parentId?: string;
}

export interface CreateCategoryResponse {
  createdIds: string[];
  duplicates: string[];
}

export interface GetCategoriesRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface GetCategoriesResponse {
  categories: Category[];
}

export interface GetCategoryPathResponse {
  path: Category[];
}
