import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  Form,
  Input,
  Switch,
  Select,
  Button,
  Table,
  InputNumber,
  Radio,
  Checkbox,
  Card,
  Row,
  Col,
  Typography,
  type InputRef,
} from "antd";
import { Category } from "@/types/category";
import {
  Product,
  CreateProductRequest,
  ProductVariant,
  VariantProperty,
  VariantType,
  VariantValue,
  ProductFormModalProps,
} from "@/types/product";
import { toast } from "react-toastify";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAuthStore } from "@/stores/authStore";
import ImageUploader from "../ImageUploader";
import { DeleteOutlined } from "@ant-design/icons";
import {
  useDeleteFileMutation,
  useUploadFileMutation,
} from "@/services/mediaServices";
import { FileTypeIdentifier } from "@/types/fileType";
import ConfirmModal from "@/components/ConfirmModal";
import { catalogApi } from "@/config/api";

const PUBLIC_CLOUDflare_URL =
  import.meta.env.VITE_PUBLIC_CLOUDflare_URL ||
  "https://pub-ba5e3c67382a42e7830b11e37a48948a.r2.dev";

const { Option } = Select;
const { Title, Text } = Typography;

interface GetCategoriesResponse {
  categories: Category[];
}

const VariantInput: React.FC<{
  type: string;
  value: VariantValue;
  isFirstType: boolean;
  onUpdate: (id: string, newValue: string) => void;
  onDelete: (id: string) => void;
  onImageUpload: (id: string, file: File) => Promise<void>;
  onImageRemove: (id: string) => void;
  onAddNew: (type: string) => void;
}> = React.memo(
  ({
    type,
    value,
    isFirstType,
    onUpdate,
    onDelete,
    onImageUpload,
    onImageRemove,
    onAddNew,
  }) => {
    const inputRef = useRef<InputRef>(null);

    const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && value.value.trim()) {
        onAddNew(type);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    };

    return (
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Input
          ref={inputRef}
          value={value.value}
          onChange={(e) => onUpdate(value.id, e.target.value)}
          onPressEnter={handleEnter}
          placeholder={`Nhập giá trị ${type}`}
          style={{ width: 200, borderRadius: 6 }}
        />
        {isFirstType && (
          <ImageUploader
            url={value.image}
            onUpload={(file) => onImageUpload(value.id, file)}
            onRemove={() => onImageRemove(value.id)}
            disabled={false}
          />
        )}
        <Button
          icon={<DeleteOutlined />}
          danger
          onClick={() => onDelete(value.id)}
          style={{ borderRadius: 6 }}
        />
      </div>
    );
  }
);

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  editingProduct,
  categoriesData,
  generateVariants,
  variantTypes,
  setVariantTypes,
}) => {
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [variantEnabled, setVariantEnabled] = useState(false);
  const [newVariantTypeName, setNewVariantTypeName] = useState<string>("");
  const [generatedVariants, setGeneratedVariants] = useState<ProductVariant[]>(
    []
  );
  const [updateAll, setUpdateAll] = useState(false);
  const [filterValues, setFilterValues] = useState<
    Record<string, string | undefined>
  >({});
  const [updatePrice, setUpdatePrice] = useState<number | null>(null);
  const [updateStock, setUpdateStock] = useState<number | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"save" | "discard" | null>(
    null
  );
  const [localCategories, setLocalCategories] = useState<Category[]>([]);

  const queryClient = useQueryClient();
  const uploadMutation = useUploadFileMutation();
  const deleteFileMutation = useDeleteFileMutation();

  const { data: apiCategoriesData, isLoading: isCategoriesLoading } =
    catalogApi.useGet("/categories", {
      pageNumber: 1,
      pageSize: 100,
    });

  useEffect(() => {
    if (apiCategoriesData?.categories) {
      setLocalCategories((prev) => {
        const apiCategories = apiCategoriesData.categories;
        const mergedCategories = [
          ...apiCategories,
          ...prev.filter(
            (localCat) =>
              !apiCategories.some(
                (apiCat: Category) => apiCat.id === localCat.id
              )
          ),
        ];
        return mergedCategories;
      });
    }
  }, [apiCategoriesData]);

  const createCategoryMutation = useMutation(
    (data: { name: string; isActive: boolean }) =>
      fetch(`${PUBLIC_CLOUDflare_URL}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: [data.name], isActive: data.isActive }),
      }).then((res) => res.json()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["catalog"]); // Làm mới danh sách category
      },
    }
  );

  // Lưu dữ liệu vào localStorage
  const saveToLocalStorage = useCallback(() => {
    const formValues = form.getFieldsValue();
    const dataToSave = {
      formValues,
      fileList,
      variantTypes,
      generatedVariants,
      variantEnabled,
    };
    localStorage.setItem("productFormData", JSON.stringify(dataToSave));
  }, [form, fileList, variantTypes, generatedVariants, variantEnabled]);

  // Khôi phục dữ liệu từ localStorage
  useEffect(() => {
    if (!editingProduct) {
      const savedFormData = localStorage.getItem("productFormData");
      if (savedFormData) {
        const parsedData = JSON.parse(savedFormData);
        form.setFieldsValue(parsedData.formValues);
        setFileList(parsedData.fileList || []);
        setVariantTypes(parsedData.variantTypes || []);
        setGeneratedVariants(parsedData.generatedVariants || []);
        setVariantEnabled(parsedData.variantEnabled || false);
      }
    }
  }, [editingProduct, form, setVariantTypes]);

  // Lưu dữ liệu khi form hoặc state thay đổi
  useEffect(() => {
    if (visible) {
      saveToLocalStorage();
    }
  }, [
    form,
    fileList,
    variantTypes,
    generatedVariants,
    variantEnabled,
    visible,
    saveToLocalStorage,
  ]);

  // Xác nhận trước khi rời trang
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.isFieldsTouched()) {
        e.preventDefault();
        e.returnValue = "Bạn có dữ liệu chưa lưu, có muốn rời trang không?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form]);

  // Xử lý xác nhận rời trang
  const handleConfirmLeave = (action: "save" | "discard") => {
    if (action === "save") {
      saveToLocalStorage();
    } else {
      localStorage.removeItem("productFormData");
    }
    setConfirmVisible(false);
    onCancel();
  };

  // Xử lý thêm category
  const handleAddCategory = useCallback(
    (values: { name: string }) => {
      createCategoryMutation.mutate(
        { name: values.name, isActive: true },
        {
          onSuccess: (data: any) => {
            const newCategory: Category = {
              id: data.createdIds[0],
              name: values.name,
              isActive: true,
              created: Date.now().toString(),
              modified: Date.now().toString(),
            };
            setLocalCategories((prev) => [...prev, newCategory]);
            form.setFieldsValue({
              categoryIds: [
                ...(form.getFieldValue("categoryIds") || []),
                newCategory.id,
              ],
            });
            setIsCategoryModalOpen(false);
            categoryForm.resetFields();
            toast.success("Thêm danh mục thành công");
          },
          onError: () => {
            toast.error("Không thể thêm danh mục");
          },
        }
      );
    },
    [createCategoryMutation, form, categoryForm]
  );

  useEffect(() => {
    if (editingProduct) {
      form.setFieldsValue({
        ...editingProduct,
        created: moment(editingProduct.created),
      });
      const types: VariantType[] = editingProduct.variants.reduce(
        (acc: VariantType[], variant) => {
          variant.properties.forEach((prop) => {
            const existingType = acc.find((t) => t.type === prop.type);
            if (!existingType) {
              acc.push({
                type: prop.type,
                values: [
                  { id: uuidv4(), value: prop.value, image: prop.image },
                ],
              });
            } else if (
              !existingType.values.some((v) => v.value === prop.value)
            ) {
              existingType.values.push({
                id: uuidv4(),
                value: prop.value,
                image: prop.image,
              });
            }
          });
          return acc;
        },
        []
      );
      setVariantTypes(types);
      setGeneratedVariants(editingProduct.variants);
      setVariantEnabled(types.length > 0);
      setFileList(
        editingProduct.imageFiles.map((fileEntry, index) => {
          const isFullUrl = fileEntry.includes(PUBLIC_CLOUDflare_URL);
          const fileName = isFullUrl ? fileEntry.split("/").pop() : fileEntry;
          const url = isFullUrl
            ? fileEntry
            : `${PUBLIC_CLOUDflare_URL}/${fileEntry}`;
          return {
            uid: `${index}`,
            name: fileName || `image-${index}`,
            status: "done",
            url,
          };
        })
      );
      const prices: Record<string, { price: number; stockCount: number }> = {};
      editingProduct.variants.forEach((variant) => {
        const key = variant.properties.map((p) => p.value).join(" ");
        prices[key] = {
          price: variant.price,
          stockCount: variant.stockCount,
        };
      });
      form.setFieldsValue({ prices });
    } else {
      form.resetFields();
      setVariantTypes([]);
      setGeneratedVariants([]);
      setVariantEnabled(false);
      setFileList([]);
    }
  }, [editingProduct, form, setVariantTypes]);

  const handleAddVariantType = useCallback(() => {
    if (newVariantTypeName.trim()) {
      setVariantTypes((prev) => [
        ...prev,
        {
          type: newVariantTypeName.trim(),
          values: [
            {
              id: uuidv4(),
              value: "",
              image: prev.length === 0 ? "" : undefined,
            },
          ],
        },
      ]);
      setNewVariantTypeName("");
    }
  }, [newVariantTypeName, setVariantTypes]);

  const handleAddNewVariantValue = useCallback(
    (type: string) => {
      setVariantTypes((prev) =>
        prev.map((t) =>
          t.type === type
            ? {
                ...t,
                values: [
                  ...t.values,
                  {
                    id: uuidv4(),
                    value: "",
                    image: t.type === variantTypes[0]?.type ? "" : undefined,
                  },
                ],
              }
            : t
        )
      );
    },
    [setVariantTypes, variantTypes]
  );

  const handleUpdateVariantValue = useCallback(
    (type: string, id: string, newValue: string) => {
      setVariantTypes((prev) =>
        prev.map((t) =>
          t.type === type
            ? {
                ...t,
                values: t.values.map((v) =>
                  v.id === id ? { ...v, value: newValue } : v
                ),
              }
            : t
        )
      );
    },
    [setVariantTypes]
  );

  const handleDeleteVariantValue = useCallback(
    (type: string, id: string) => {
      setVariantTypes((prev) =>
        prev.map((t) =>
          t.type === type
            ? { ...t, values: t.values.filter((v) => v.id !== id) }
            : t
        )
      );
    },
    [setVariantTypes]
  );

  const handleImageUpload = useCallback(
    async (id: string, file: File) => {
      const fileTypes = JSON.parse(localStorage.getItem("fileTypes") || "[]");
      const fileType = fileTypes.find(
        (ft: any) => ft.identifier === FileTypeIdentifier.ImageProduct
      );
      const fileTypeId = fileType ? fileType.id : "";
      const userId = useAuthStore.getState().user?.id || "";

      try {
        await uploadMutation.mutateAsync(
          { file, fileTypeId, userId },
          {
            onSuccess: (data) => {
              const fileName = data.storageLocation;
              const imageUrl = `${PUBLIC_CLOUDflare_URL}/${fileName}`;
              setVariantTypes((prev) =>
                prev.map((t) => ({
                  ...t,
                  values: t.values.map((v) =>
                    v.id === id ? { ...v, image: imageUrl } : v
                  ),
                }))
              );
            },
            onError: (error: any) => {
              toast.error("Không thể tải lên hình ảnh biến thể");
            },
          }
        );
      } catch (error) {
        console.error("Upload mutation failed:", error);
      }
    },
    [uploadMutation, setVariantTypes]
  );

  const handleRemoveImage = useCallback(
    (type: string, id: string) => {
      setVariantTypes((prev) =>
        prev.map((t) =>
          t.type === type
            ? {
                ...t,
                values: t.values.map((v) =>
                  v.id === id ? { ...v, image: undefined } : v
                ),
              }
            : t
        )
      );
    },
    [setVariantTypes]
  );

  const handleGeneratePriceTable = useCallback(() => {
    const newVariants = generateVariants(variantTypes);
    setGeneratedVariants(newVariants);
    setFilterValues({});
    setUpdatePrice(null);
    setUpdateStock(null);
    setUpdateAll(false);
    const prices: Record<string, { price: number; stockCount: number }> = {};
    newVariants.forEach((variant) => {
      const key = variant.properties.map((p) => p.value).join(" ");
      prices[key] = {
        price: variant.price,
        stockCount: variant.stockCount,
      };
    });
    form.setFieldsValue({ prices });
  }, [generateVariants, variantTypes, form]);

  const handleUpdatePrices = useCallback(() => {
    setGeneratedVariants((prev) => {
      const updatedVariants = prev.map((variant) => {
        const matchesFilter =
          updateAll ||
          Object.entries(filterValues).every(
            ([type, value]) =>
              !value ||
              variant.properties.some(
                (prop) => prop.type === type && prop.value === value
              )
          );
        if (matchesFilter) {
          return {
            ...variant,
            price: updatePrice !== null ? updatePrice : variant.price,
            stockCount: updateStock !== null ? updateStock : variant.stockCount,
          };
        }
        return variant;
      });

      const prices: Record<string, { price: number; stockCount: number }> = {};
      updatedVariants.forEach((variant) => {
        const key = variant.properties.map((p) => p.value).join(" ");
        prices[key] = {
          price: variant.price,
          stockCount: variant.stockCount,
        };
      });
      form.setFieldsValue({ prices });

      return updatedVariants;
    });
  }, [updateAll, filterValues, updatePrice, updateStock, form]);

  const handleFilterChange = (type: string, value: string | undefined) => {
    setFilterValues((prev) => ({ ...prev, [type]: value }));
  };

  const handleProductImageUpload = (file: File) => {
    const fileTypes = JSON.parse(localStorage.getItem("fileTypes") || "[]");
    const fileType = fileTypes.find(
      (ft: any) => ft.identifier === FileTypeIdentifier.ImageProduct
    );
    const fileTypeId = fileType ? fileType.id : "";
    const userId = useAuthStore.getState().user?.id || "";

    uploadMutation.mutate(
      { file, fileTypeId, userId },
      {
        onSuccess: (data) => {
          const fileName = data.storageLocation;
          const url = `${PUBLIC_CLOUDflare_URL}/${fileName}`;
          const newFile = {
            uid: uuidv4(),
            name: file.name,
            status: "done",
            url,
          };
          setFileList((prev) => [...prev, newFile]);
          form.setFieldsValue({
            imageFiles: [...fileList, newFile].map((f) => f.url),
          });
        },
        onError: () => {
          toast.error("Không thể tải lên hình ảnh sản phẩm");
        },
      }
    );
  };

  const handleRemoveProductImage = (file: any) => {
    if (!file.url) {
      const newFileList = fileList.filter((item) => item.uid !== file.uid);
      setFileList(newFileList);
      form.setFieldsValue({ imageFiles: newFileList.map((item) => item.url) });
      return;
    }

    const isFullUrl = file.url.includes(PUBLIC_CLOUDflare_URL);
    const fileName = isFullUrl ? file.url.split("/").pop() : file.url;

    if (fileName) {
      deleteFileMutation.mutate(fileName, {
        onSuccess: () => {
          const newFileList = fileList.filter((item) => item.uid !== file.uid);
          setFileList(newFileList);
          form.setFieldsValue({
            imageFiles: newFileList.map((item) => item.url),
          });
        },
        onError: () => {
          toast.error("Không thể xóa hình ảnh sản phẩm");
        },
      });
    }
  };

  const handleSubmit = useCallback(
    (values: any) => {
      const request: CreateProductRequest = {
        name: values.name,
        categoryIds: values.categoryIds || [],
        description: values.description || "",
        imageFiles: fileList.map((file) =>
          file.url.includes(PUBLIC_CLOUDflare_URL)
            ? file.url
            : `${PUBLIC_CLOUDflare_URL}/${file.url}`
        ),
        isHot: values.isHot || false,
        isActive: values.isActive !== undefined ? values.isActive : true,
        variants: generatedVariants.map((variant) => ({
          properties: variant.properties,
          price:
            values.prices?.[variant.properties.map((p) => p.value).join(" ")]
              ?.price || 0,
          stockCount:
            values.prices?.[variant.properties.map((p) => p.value).join(" ")]
              ?.stockCount || 0,
        })),
      };
      onSubmit(request);
      localStorage.removeItem("productFormData"); // Xóa sau khi submit
    },
    [generatedVariants, onSubmit, fileList]
  );

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        handleSubmit(values);
      })
      .catch((errorInfo) => {
        toast.error("Vui lòng điền đầy đủ và đúng các trường bắt buộc");
      });
  };

  const handleCancel = () => {
    if (form.isFieldsTouched()) {
      setConfirmVisible(true);
      setConfirmAction("discard");
    } else {
      onCancel();
    }
  };

  const variantColumns = [
    {
      title: "Tên biến thể",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: ProductVariant) => (
        <Input
          value={record.properties
            .map((p) => `${p.type}: ${p.value}`)
            .join(", ")}
          readOnly
          style={{ borderRadius: 6 }}
        />
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (_: any, record: ProductVariant) => (
        <Form.Item
          name={[
            "prices",
            record.properties.map((p) => p.value).join(" "),
            "price",
          ]}
          initialValue={record.price}
          noStyle
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: 120, borderRadius: 6 }}
          />
        </Form.Item>
      ),
    },
    {
      title: "Số lượng tồn kho",
      dataIndex: "stockCount",
      key: "stockCount",
      render: (_: any, record: ProductVariant) => (
        <Form.Item
          name={[
            "prices",
            record.properties.map((p) => p.value).join(" "),
            "stockCount",
          ]}
          initialValue={record.stockCount}
          noStyle
        >
          <InputNumber min={0} style={{ width: 120, borderRadius: 6 }} />
        </Form.Item>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
        open={visible}
        onCancel={handleCancel}
        onOk={handleOk}
        width={1200}
        style={{ top: 20 }}
        bodyStyle={{ padding: 24, background: "#f5f5f5" }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Card
            title={<Title level={4}>Thông tin cơ bản</Title>}
            style={{ marginBottom: 24, borderRadius: 8 }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Tên sản phẩm"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên sản phẩm" },
                  ]}
                >
                  <Input style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div style={{ display: "flex", gap: 8 }}>
                  <Form.Item
                    name="categoryIds"
                    label="Danh mục"
                    style={{ flex: 1 }}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ít nhất một danh mục",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn danh mục"
                      loading={isCategoriesLoading}
                      style={{ width: "100%", borderRadius: 6 }}
                    >
                      {localCategories.map((cat: Category) => (
                        <Option key={cat.id} value={cat.id}>
                          {cat.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Button
                    type="primary"
                    onClick={() => setIsCategoryModalOpen(true)}
                    style={{ alignSelf: "flex-end", borderRadius: 6 }}
                  >
                    Thêm danh mục
                  </Button>
                </div>
              </Col>
              <Col span={24}>
                <Form.Item name="description" label="Mô tả">
                  <Input.TextArea rows={4} style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                  <Form.Item
                    name="isHot"
                    label="Sản phẩm nổi bật"
                    valuePropName="checked"
                    style={{ margin: 0 }}
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    name="isActive"
                    label="Kích hoạt"
                    valuePropName="checked"
                    style={{ margin: 0 }}
                  >
                    <Switch defaultChecked />
                  </Form.Item>
                </div>
              </Col>
            </Row>
          </Card>

          <Card
            title={<Title level={4}>Hình ảnh sản phẩm</Title>}
            style={{ marginBottom: 24, borderRadius: 8 }}
          >
            <Form.Item
              name="imageFiles"
              label="Tải lên hình ảnh (tối đa 5)"
              rules={[
                {
                  required: true,
                  message: "Vui lòng tải lên ít nhất một hình ảnh",
                },
                {
                  validator: (_, value) =>
                    value && value.length <= 5
                      ? Promise.resolve()
                      : Promise.reject(
                          "Bạn chỉ có thể tải lên tối đa 5 hình ảnh"
                        ),
                },
              ]}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {fileList.map((file) => (
                  <ImageUploader
                    key={file.uid}
                    url={file.url}
                    onUpload={handleProductImageUpload}
                    onRemove={() => handleRemoveProductImage(file)}
                    disabled={
                      uploadMutation.isLoading || deleteFileMutation.isLoading
                    }
                  />
                ))}
                {fileList.length < 5 && (
                  <ImageUploader
                    onUpload={handleProductImageUpload}
                    onRemove={() => {}}
                    disabled={uploadMutation.isLoading}
                  />
                )}
              </div>
            </Form.Item>
          </Card>

          <Card
            title={<Title level={4}>Biến thể sản phẩm</Title>}
            style={{ marginBottom: 24, borderRadius: 8 }}
          >
            <Form.Item label="Kích hoạt biến thể">
              <Radio.Group
                value={variantEnabled}
                onChange={(e) => setVariantEnabled(e.target.value)}
              >
                <Radio value={false}>Không</Radio>
                <Radio value={true}>Có</Radio>
              </Radio.Group>
            </Form.Item>

            {variantEnabled && (
              <>
                <Form.Item label="Thêm loại biến thể">
                  <div style={{ display: "flex", gap: 8 }}>
                    <Input
                      placeholder="Nhập tên loại biến thể (ví dụ: Màu sắc, Dung lượng)"
                      value={newVariantTypeName}
                      onChange={(e) => setNewVariantTypeName(e.target.value)}
                      style={{ width: 300, borderRadius: 6 }}
                    />
                    <Button
                      type="primary"
                      onClick={handleAddVariantType}
                      style={{ borderRadius: 6 }}
                    >
                      Thêm
                    </Button>
                  </div>
                </Form.Item>

                {variantTypes.map((typeObj, index) => (
                  <Form.Item key={typeObj.type} label={`${typeObj.type}`}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        width: "100%",
                      }}
                    >
                      {typeObj.values.map((v) => (
                        <VariantInput
                          key={v.id}
                          type={typeObj.type}
                          value={v}
                          isFirstType={index === 0}
                          onUpdate={handleUpdateVariantValue.bind(
                            null,
                            typeObj.type
                          )}
                          onDelete={handleDeleteVariantValue.bind(
                            null,
                            typeObj.type
                          )}
                          onImageUpload={handleImageUpload}
                          onImageRemove={handleRemoveImage.bind(
                            null,
                            typeObj.type
                          )}
                          onAddNew={handleAddNewVariantValue}
                        />
                      ))}
                      <Button
                        type="dashed"
                        onClick={() => handleAddNewVariantValue(typeObj.type)}
                        style={{ width: "100%", borderRadius: 6 }}
                      >
                        Thêm giá trị {typeObj.type}
                      </Button>
                    </div>
                  </Form.Item>
                ))}

                <Form.Item label="Tạo bảng giá">
                  <Button
                    type="primary"
                    onClick={handleGeneratePriceTable}
                    style={{ borderRadius: 6 }}
                  >
                    Tạo bảng giá
                  </Button>
                </Form.Item>

                {generatedVariants.length > 0 && (
                  <>
                    <Form.Item label="Cập nhật giá và tồn kho">
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        {variantTypes.map((typeObj) => (
                          <div
                            key={typeObj.type}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <Text strong>{`Lọc theo ${typeObj.type}`}</Text>
                            <Select
                              placeholder={`Chọn ${typeObj.type}`}
                              allowClear
                              style={{ width: 150, borderRadius: 6 }}
                              value={filterValues[typeObj.type]}
                              onChange={(value) =>
                                handleFilterChange(typeObj.type, value)
                              }
                            >
                              {typeObj.values.map((v) => (
                                <Option key={v.id} value={v.value}>
                                  {v.value}
                                </Option>
                              ))}
                            </Select>
                          </div>
                        ))}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <Text strong>Giá</Text>
                          <InputNumber
                            min={0}
                            step={0.01}
                            style={{ width: 120, borderRadius: 6 }}
                            value={updatePrice}
                            onChange={(value) =>
                              setUpdatePrice(value as number | null)
                            }
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <Text strong>Số lượng tồn kho</Text>
                          <InputNumber
                            min={0}
                            style={{ width: 120, borderRadius: 6 }}
                            value={updateStock}
                            onChange={(value) =>
                              setUpdateStock(value as number | null)
                            }
                          />
                        </div>
                        <Checkbox
                          checked={updateAll}
                          onChange={(e) => setUpdateAll(e.target.checked)}
                          style={{ marginTop: 24 }}
                        >
                          Cập nhật tất cả biến thể
                        </Checkbox>
                        <Button
                          type="primary"
                          onClick={handleUpdatePrices}
                          style={{ marginTop: 24, borderRadius: 6 }}
                        >
                          Cập nhật
                        </Button>
                      </div>
                    </Form.Item>

                    <Form.Item label="Danh sách biến thể">
                      <Table
                        columns={variantColumns}
                        dataSource={generatedVariants}
                        pagination={false}
                        rowKey={(record) =>
                          record.properties.map((p) => p.value).join(" ")
                        }
                        size="small"
                        bordered
                        rowClassName={(record, index) =>
                          index % 2 === 0 ? "table-row-light" : "table-row-dark"
                        }
                        style={{ background: "#fff", borderRadius: 6 }}
                      />
                    </Form.Item>
                  </>
                )}
              </>
            )}
          </Card>
        </Form>
      </Modal>

      <Modal
        title="Thêm danh mục mới"
        open={isCategoryModalOpen}
        onCancel={() => setIsCategoryModalOpen(false)}
        onOk={() => {
          categoryForm
            .validateFields()
            .then(handleAddCategory)
            .catch(() => toast.error("Vui lòng nhập tên danh mục"));
        }}
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input style={{ borderRadius: 6 }} />
          </Form.Item>
        </Form>
      </Modal>

      <ConfirmModal
        visible={confirmVisible}
        text={
          confirmAction === "save"
            ? "Bạn có muốn lưu dữ liệu sản phẩm trước khi rời trang không?"
            : "Bạn có muốn hủy và xóa dữ liệu đã nhập không?"
        }
        onConfirm={() =>
          handleConfirmLeave(confirmAction === "save" ? "save" : "discard")
        }
        onCancel={() => setConfirmVisible(false)}
      />
    </>
  );
};

export default ProductFormModal;
