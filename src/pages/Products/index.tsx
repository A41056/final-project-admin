import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Row,
  Col,
  DatePicker,
  Select,
  Form,
  Modal,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getProductsQuery,
  createProductMutation,
  updateProductMutation,
  deleteProductMutation,
} from "@/services/productServices";
import { getCategoriesQuery } from "@/services/categoryServices";
import { uploadFileMutation } from "@/services/mediaServices";
import {
  Product,
  CreateProductRequest,
  ProductVariant,
  VariantProperty,
} from "@/types/product";
import { Category } from "@/types/category";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useAuthStore } from "@/stores/authStore";
import ProductFormModal from "@/components/ProductFormModal";
import moment from "moment";

const { Option } = Select;

interface VariantType {
  type: string;
  values: { value: string; image?: string }[];
}

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
  const [fileList, setFileList] = useState<any[]>([]);
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    ...getProductsQuery({
      ...filters,
      pageNumber: currentPage,
      pageSize,
    }),
    onError: (error: any) => handleError(error, "fetch products"),
  });

  const { data: categoriesData, error: categoriesError } = useQuery({
    ...getCategoriesQuery({ pageSize: 100 }),
    onError: (error: any) => handleError(error, "fetch categories"),
  });

  const createMutation = useMutation({
    ...createProductMutation(),
    onSuccess: () => {
      toast.success("Product added successfully");
      setIsModalVisible(false);
      queryClient.invalidateQueries(["products"]);
    },
    onError: (error: any) => handleError(error, "add product"),
  });

  const updateMutation = useMutation({
    ...updateProductMutation(),
    onSuccess: () => {
      toast.success("Product updated successfully");
      setIsModalVisible(false);
      queryClient.invalidateQueries(["products"]);
    },
    onError: (error: any) => handleError(error, "update product"),
  });

  const deleteMutation = useMutation({
    ...deleteProductMutation(),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries(["products"]);
    },
    onError: (error: any) => handleError(error, "delete product"),
  });

  const uploadMutation = useMutation({
    ...uploadFileMutation(),
    onSuccess: (data, variables) => {
      const imageUrl = `${
        import.meta.env.MEDIA_API_URL || "http://localhost:6010"
      }/files/${data.fileId}`;
      const currentImageFiles = form.getFieldValue("imageFiles") || [];
      form.setFieldsValue({ imageFiles: [...currentImageFiles, imageUrl] });
      setFileList((prev) => [
        ...prev,
        {
          uid: variables.file.name,
          name: variables.file.name,
          status: "done",
          url: imageUrl,
        },
      ]);
      toast.success("Image uploaded successfully");
    },
    onError: (error: any) => handleError(error, "upload image"),
  });

  const [form] = Form.useForm();

  useEffect(() => {
    setFilters((prev) => ({ ...prev, pageNumber: currentPage }));
  }, [currentPage]);

  const handleError = (error: any, action: string) => {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      "An unknown error occurred";
    toast.error(`Failed to ${action}: ${errorMessage}`);
  };

  const showModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsModalVisible(true);
  };

  const handleSubmit = (values: CreateProductRequest) => {
    const variants = generateVariants();
    const variantImages = form.getFieldValue("variantImages") || {};
    variants.forEach((variant) => {
      const firstProp = variant.properties.find(
        (p) => p.type === variantTypes[0]?.type
      );
      if (firstProp && variantImages[firstProp.value]) {
        const imageFile = variantImages[firstProp.value][0];
        firstProp.image = imageFile?.url || imageFile?.response?.fileId || "";
      }
    });
    const updatedValues = { ...values, variants };
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: updatedValues });
    } else {
      createMutation.mutate(updatedValues);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this product?",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleUpload = (file: File) => {
    const userId =
      useAuthStore.getState().user?.id ||
      "550e8400-e29b-41d4-a716-446655440000";
    const fileTypeId = "a7ff0762-931c-4faf-8ece-e158ea48bd0c";
    const productId = editingProduct?.id;

    uploadMutation.mutate({ file, fileTypeId, userId, productId });
    return false;
  };

  const uploadProps = {
    onRemove: (file: any) => {
      const newFileList = fileList.filter((item) => item.uid !== file.uid);
      setFileList(newFileList);
      form.setFieldsValue({ imageFiles: newFileList.map((item) => item.url) });
    },
    beforeUpload: handleUpload,
    fileList,
    multiple: true,
  };

  const generateVariants = (): ProductVariant[] => {
    const types = variantTypes.map((t) => t.type);
    const variants: ProductVariant[] = [];
    const prices = form.getFieldValue("prices") || {};

    if (types.length === 0) return [];

    const generateCombinations = (
      current: VariantProperty[],
      remainingTypes: string[]
    ): ProductVariant[] => {
      if (remainingTypes.length === 0) {
        const name = current.map((p) => p.value).join(" ");
        return [
          {
            properties: current,
            price: prices[name]?.price || 0,
            stockCount: prices[name]?.stockCount || 0,
          },
        ];
      }

      const type = remainingTypes[0];
      const values = variantTypes.find((t) => t.type === type)?.values || [];
      const result: ProductVariant[] = [];

      values.forEach((v) => {
        const newProperty = { type, value: v.value, image: v.image };
        result.push(
          ...generateCombinations(
            [...current, newProperty],
            remainingTypes.slice(1)
          )
        );
      });

      return result;
    };

    return generateCombinations([], types);
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Variants",
      key: "variants",
      render: (_: any, record: Product) => (
        <span>{record.variants.length} variants</span>
      ),
    },
    {
      title: "Is Hot",
      dataIndex: "isHot",
      key: "isHot",
      render: (isHot: boolean) => (
        <span style={{ color: isHot ? "#ff4d4f" : "#8c8c8c" }}>
          {isHot ? "Yes" : "No"}
        </span>
      ),
    },
    {
      title: "Is Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <span style={{ color: isActive ? "#52c41a" : "#f5222d" }}>
          {isActive ? "Yes" : "No"}
        </span>
      ),
    },
    {
      title: "Created",
      dataIndex: "created",
      key: "created",
      render: (created: string) => moment(created).format("YYYY-MM-DD"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Product) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
          />
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input.Search
            placeholder="Search products"
            onSearch={(value) => handleFilterChange("search", value)}
          />
        </Col>
        <Col span={6}>
          <Select
            mode="multiple"
            placeholder="Filter by Categories"
            style={{ width: "100%" }}
            onChange={(value) => handleFilterChange("categoryIds", value)}
            allowClear
          >
            {categoriesData?.categories.map((cat: Category) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={4}>
          <Select
            placeholder="Filter by Is Hot"
            style={{ width: "100%" }}
            onChange={(value) =>
              handleFilterChange(
                "isHot",
                value === "true" ? true : value === "false" ? false : undefined
              )
            }
            allowClear
          >
            <Option value="true">Yes</Option>
            <Option value="false">No</Option>
          </Select>
        </Col>
        <Col span={4}>
          <Select
            placeholder="Filter by Is Active"
            style={{ width: "100%" }}
            onChange={(value) =>
              handleFilterChange(
                "isActive",
                value === "true" ? true : value === "false" ? false : undefined
              )
            }
            allowClear
          >
            <Option value="true">Yes</Option>
            <Option value="false">No</Option>
          </Select>
        </Col>
        <Col span={4}>
          <DatePicker.RangePicker
            onChange={(dates) => {
              handleFilterChange(
                "createdFrom",
                dates ? dates[0]?.toISOString() : undefined
              );
              handleFilterChange(
                "createdTo",
                dates ? dates[1]?.toISOString() : undefined
              );
            }}
            style={{ width: "100%" }}
          />
        </Col>
      </Row>

      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Add Product
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={productsData?.products || []}
        loading={productsLoading}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize,
          total: productsData?.totalItems || 0,
          onChange: (page) => setCurrentPage(page),
          position: ["bottomCenter"],
        }}
      />

      <ProductFormModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
        categoriesData={categoriesData}
        uploadProps={uploadProps}
        generateVariants={generateVariants}
        variantTypes={variantTypes}
        setVariantTypes={setVariantTypes}
      />
    </div>
  );
};

export default ProductsPage;
