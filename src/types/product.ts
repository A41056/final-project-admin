import { Category } from "./category";

export interface Product {
  id: string;
  name: string;
  description: string;
  imageFiles: string[];
  isHot: boolean;
  isActive: boolean;
  created: string;
  modified: string;
  categoryIds: string[];
  tags: string[];
  variants: ProductVariant[];
}

export interface ProductVariant {
  properties: VariantProperty[];
  price: number;
  stockCount: number;
}

export interface VariantProperty {
  type: string;
  value: string;
  image?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  imageFiles: string[];
  isHot: boolean;
  isActive: boolean;
  categoryIds: string[];
  tags: string[];
  variants: ProductVariant[];
}

export interface CreateProductResponse {
  id: string;
}

export interface GetProductsRequest {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  categoryIds?: string[];
  isHot?: boolean;
  isActive?: boolean;
  tags?: string[];
  createdFrom?: string;
  createdTo?: string;
}

export interface GetProductsResponse {
  products: Product[];
  totalItems: number;
}

export interface VariantValue {
  id: string;
  value: string;
  image?: string;
}

export interface VariantType {
  type: string;
  values: VariantValue[];
}

export interface ProductFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateProductRequest) => void;
  editingProduct: Product | null;
  categoriesData: { categories: Category[] } | undefined;
  uploadProps: any;
  generateVariants: (variantTypes: VariantType[]) => ProductVariant[];
  variantTypes: VariantType[];
  setVariantTypes: React.Dispatch<React.SetStateAction<VariantType[]>>;
}
