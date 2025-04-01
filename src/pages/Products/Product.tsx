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
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FireOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { catalogApi, mediaApi } from "@/config/api"; // Sử dụng api.ts
import { useAuthStore } from "@/stores/authStore";
import ProductFormModal from "@/components/ProductFormModal";
import moment from "moment";
import {
  Product,
  CreateProductRequest,
  ProductVariant,
  VariantProperty,
  VariantType,
  VariantValue,
} from "@/types/product";
import { Category } from "@/types/category";
import { useQuery, useMutation, useQueryClient } from "react-query";

const PUBLIC_CLOUDflare_URL =
  import.meta.env.VITE_PUBLIC_CLOUDflare_URL ||
  "https://pub-ba5e3c67382a42e7830b11e37a48948a.r2.dev";

const { Option } = Select;

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

  // Fetch products using catalogApi
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = catalogApi.useGet("/products", {
    ...filters,
    pageNumber: currentPage,
    pageSize,
  });

  // Fetch categories using catalogApi
  const { data: categoriesData, isError: categoriesError } = catalogApi.useGet(
    "/categories",
    { pageSize: 100 }
  );

  // Mutations
  const createMutation = catalogApi.usePost();
  const updateMutation = catalogApi.usePut();
  const deleteMutation = catalogApi.useDelete();
  const uploadMutation = mediaApi.useUploadFile();

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
    if (editingProduct) {
      updateMutation.mutate(
        { endpoint: `/products/${editingProduct.id}`, data: values },
        {
          onSuccess: () => {
            toast.success("Product updated successfully");
            setIsModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ["catalog"] });
          },
          onError: (error: any) => handleError(error, "update product"),
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
          onError: (error: any) => handleError(error, "add product"),
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this product?",
      onOk: () =>
        deleteMutation.mutate(`/products/${id}`, {
          onSuccess: () => {
            toast.success("Product deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["catalog"] });
          },
          onError: (error: any) => handleError(error, "delete product"),
        }),
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
    const fileTypeId = "a7ff0762-931c-4faf-8ece-e158ea48bd0c"; // Giả định ImageProduct
    const productId = editingProduct?.id;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileTypeId", fileTypeId);
    formData.append("userId", userId);
    if (productId) formData.append("productId", productId);

    uploadMutation.mutate(formData, {
      onSuccess: (data) => {
        const fileName = data.storageLocation;
        const fileUrl = `${PUBLIC_CLOUDflare_URL}/${fileName}`;
        const currentImageFiles = form.getFieldValue("imageFiles") || [];
        form.setFieldsValue({ imageFiles: [...currentImageFiles, fileUrl] });
        setFileList((prev) => [
          ...prev,
          { uid: file.name, name: file.name, status: "done", url: fileUrl },
        ]);
        toast.success("Image uploaded successfully");
      },
      onError: (error: any) => handleError(error, "upload image"),
    });
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

    if (types.length === 0) return [];

    const generateCombinations = (
      current: VariantProperty[],
      remainingTypes: string[]
    ): ProductVariant[] => {
      if (remainingTypes.length === 0) {
        return [{ properties: current, price: 0, stockCount: 0 }];
      }

      const type = remainingTypes[0];
      const values =
        variantTypes.find((t: VariantType) => t.type === type)?.values || [];
      const result: ProductVariant[] = [];

      values.forEach((v: VariantValue) => {
        const newProperty: VariantProperty = {
          type,
          value: v.value,
          image: v.image,
        };
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

  const columns: import("antd").TableColumnType<Product>[] = [
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
        <span>
          {isHot ? (
            <FireOutlined style={{ color: "#ff4500", fontSize: "20px" }} />
          ) : (
            <FireOutlined style={{ color: "#d3d3d3", fontSize: "20px" }} />
          )}
        </span>
      ),
      align: "center" as const,
    },
    {
      title: "Is Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Switch
          checked={isActive}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          disabled
          style={{
            backgroundColor: isActive ? "#52c41a" : "#d9d9d9",
          }}
        />
      ),
      align: "center" as const,
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
            placeholder={
              <span>
                <FireOutlined /> Filter by Is Hot
              </span>
            }
            style={{ width: "100%" }}
            onChange={(value) =>
              handleFilterChange(
                "isHot",
                value === "true" ? true : value === "false" ? false : undefined
              )
            }
            allowClear
          >
            <Option value="true">
              <FireOutlined style={{ color: "#ff4500", marginRight: 8 }} /> Yes
            </Option>
            <Option value="false">
              <FireOutlined style={{ color: "#d3d3d3", marginRight: 8 }} /> No
            </Option>
          </Select>
        </Col>
        <Col span={4}>
          <Select
            placeholder={
              <span>
                <Switch checked disabled /> Filter by Is Active
              </span>
            }
            style={{ width: "100%" }}
            onChange={(value) =>
              handleFilterChange(
                "isActive",
                value === "true" ? true : value === "false" ? false : undefined
              )
            }
            allowClear
          >
            <Option value="true">
              <Switch checked disabled style={{ marginRight: 8 }} /> Yes
            </Option>
            <Option value="false">
              <Switch disabled style={{ marginRight: 8 }} /> No
            </Option>
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
