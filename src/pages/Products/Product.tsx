import React, { useState, useEffect } from "react";
import { catalogApi, mediaApi } from "@/config/api";
import { useQueryClient } from "react-query";
import { toast } from "react-toastify";
import FiltersPanel from "@/components/Product/FiltersPanel";
import ProductActions from "@/components/Product/ProductActions";
import ProductTable from "@/components/Product/ProductTable";
import ProductFormModal from "@/components/Product/ProductFormModal";
import { Product, VariantType, CreateProductRequest } from "@/types/product";
import { generateVariants } from "@/utils/generateVariants";

const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState({
    search: "",
    categoryIds: [] as string[],
    isHot: undefined as boolean | undefined,
    isActive: undefined as boolean | undefined,
    createdFrom: undefined as string | undefined,
    createdTo: undefined as string | undefined,
    pageNumber: 1,
    pageSize: 10,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);

  const { data: productsData, isLoading: productsLoading } = catalogApi.useGet(
    "/products",
    { ...filters, pageNumber: currentPage, pageSize }
  );

  const { data: categoriesData } = catalogApi.useGet("/categories", { pageSize: 100 });

  const createMutation = catalogApi.usePost();
  const updateMutation = catalogApi.usePut();
  const deleteMutation = catalogApi.useDelete();
  const uploadMutation = mediaApi.useUploadFile();

  useEffect(() => {
    setFilters((prev) => ({ ...prev, pageNumber: currentPage }));
  }, [currentPage]);

  const handleError = (error: any, action: string) => {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      "An unknown error occurred";
    toast.error(`Failed to ${action}: ${msg}`);
  };

  const showModal = (product?: Product | null) => {
    setEditingProduct(product || null);
    setIsModalVisible(true);
  };

  const handleSubmit = (values: CreateProductRequest) => {
    if (editingProduct) {
      updateMutation.mutate(
        { endpoint: `/products/${editingProduct.id}`, data: values },
        {
          onSuccess: () => {
            toast.success("Product updated successfully");
            setIsModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ["catalog"] });
          },
          onError: (e) => handleError(e, "update product"),
        }
      );
    } else {
      createMutation.mutate(
        { endpoint: "/products", data: values },
        {
          onSuccess: () => {
            toast.success("Product added successfully");
            setIsModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ["catalog"] });
          },
          onError: (e) => handleError(e, "add product"),
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    import("antd").then(({ Modal }) => {
      Modal.confirm({
        title: "Are you sure you want to delete this product?",
        onOk: () =>
          deleteMutation.mutate(`/products/${id}`, {
            onSuccess: () => {
              toast.success("Product deleted successfully");
              queryClient.invalidateQueries({ queryKey: ["catalog"] });
            },
            onError: (e) => handleError(e, "delete product"),
          }),
      });
    });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: 24 }}>
      <FiltersPanel filters={filters} categoriesData={categoriesData} onFilterChange={handleFilterChange} />
      <ProductActions onAddClick={() => showModal(null)} />
      <ProductTable
        products={productsData?.products || []}
        loading={productsLoading}
        onEdit={showModal}
        onDelete={handleDelete}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={productsData?.totalItems || 0}
        onPageChange={setCurrentPage}
      />
      <ProductFormModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
        categoriesData={categoriesData}
        uploadProps={{ mutation: uploadMutation }}
        variantTypes={variantTypes}
        setVariantTypes={setVariantTypes}
        generateVariants={generateVariants}
      />
    </div>
  );
};

export default ProductsPage;