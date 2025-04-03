import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  Form,
  Input,
  Switch,
  Select,
  Button,
  Space,
  Table,
  InputNumber,
  Radio,
  Checkbox,
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
import { useMutation } from "react-query";
import { useAuthStore } from "@/stores/authStore";
import ImageUploader from "../ImageUploader";
import { DeleteOutlined } from "@ant-design/icons";
import {
  useDeleteFileMutation,
  useUploadFileMutation,
} from "@/services/mediaServices";

const PUBLIC_CLOUDflare_URL =
  import.meta.env.VITE_PUBLIC_CLOUDflare_URL ||
  "https://pub-ba5e3c67382a42e7830b11e37a48948a.r2.dev";

const { Option } = Select;

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
      <Space style={{ marginBottom: 8 }}>
        <Input
          ref={inputRef}
          value={value.value}
          onChange={(e) => onUpdate(value.id, e.target.value)}
          onPressEnter={handleEnter}
          placeholder={`Enter ${type} value`}
          style={{ width: 200 }}
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
        />
      </Space>
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

  const uploadMutation = useUploadFileMutation();
  const deleteFileMutation = useDeleteFileMutation();

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
      console.log("handleImageUpload called with id:", id, "file:", file);
      const fileTypes = JSON.parse(localStorage.getItem("fileTypes") || "[]");
      const fileType = fileTypes.find(
        (ft: any) => ft.identifier === "ImageProduct"
      );
      const fileTypeId = fileType
        ? fileType.id
        : "a7ff0762-931c-4faf-8ece-e158ea48bd0c";
      const userId =
        useAuthStore.getState().user?.id ||
        "550e8400-e29b-41d4-a716-446655440000";

      try {
        await uploadMutation.mutateAsync(
          { file, fileTypeId, userId },
          {
            onSuccess: (data) => {
              console.log("Upload success:", data);
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
              console.error("Upload error:", error);
              toast.error("Failed to upload variant image");
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
      (ft: any) => ft.identifier === "ImageProduct"
    );
    const fileTypeId = fileType
      ? fileType.id
      : "a7ff0762-931c-4faf-8ece-e158ea48bd0c";
    const userId =
      useAuthStore.getState().user?.id ||
      "550e8400-e29b-41d4-a716-446655440000";

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
          toast.error("Failed to upload product image");
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
          toast.error("Failed to delete product image");
        },
      });
    }
  };

  const handleSubmit = useCallback(
    (values: any) => {
      console.log("Form values:", values); // Debug log
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
      console.log("Submit request:", request); // Debug log
      onSubmit(request);
    },
    [generatedVariants, onSubmit, fileList]
  );

  const handleOk = () => {
    console.log("OK button clicked"); // Debug log
    form
      .validateFields()
      .then((values) => {
        handleSubmit(values);
      })
      .catch((errorInfo) => {
        console.error("Validation failed:", errorInfo); // Debug log
        toast.error("Please fill in all required fields correctly");
      });
  };

  const variantColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: ProductVariant) => (
        <Input
          value={record.properties
            .map((p) => `${p.type}: ${p.value}`)
            .join(", ")}
          readOnly
        />
      ),
    },
    {
      title: "Price",
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
          <InputNumber min={0} step={0.01} />
        </Form.Item>
      ),
    },
    {
      title: "Stock Count",
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
          <InputNumber min={0} />
        </Form.Item>
      ),
    },
  ];

  return (
    <Modal
      title={editingProduct ? "Edit Product" : "Add Product"}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk} // Thay vì form.submit()
      width={1000}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter product name" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name="imageFiles"
          label="Images"
          rules={[
            { required: true, message: "Please upload at least one image" },
            {
              validator: (_, value) =>
                value && value.length <= 5
                  ? Promise.resolve()
                  : Promise.reject("You can upload a maximum of 5 images"),
            },
          ]}
        >
          <Space wrap>
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
          </Space>
        </Form.Item>
        <Form.Item name="isHot" label="Is Hot" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="isActive" label="Is Active" valuePropName="checked">
          <Switch defaultChecked />
        </Form.Item>
        <Form.Item name="categoryIds" label="Categories">
          <Select mode="multiple" placeholder="Select categories">
            {categoriesData?.categories.map((cat: Category) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Enable Variants">
          <Radio.Group
            value={variantEnabled}
            onChange={(e) => setVariantEnabled(e.target.value)}
          >
            <Radio value={false}>No</Radio>
            <Radio value={true}>Yes</Radio>
          </Radio.Group>
        </Form.Item>
        {variantEnabled && (
          <>
            <Form.Item label="Add Variant Type">
              <Space>
                <Input
                  placeholder="Enter variant type name (e.g., Color, Storage)"
                  value={newVariantTypeName}
                  onChange={(e) => setNewVariantTypeName(e.target.value)}
                />
                <Button type="primary" onClick={handleAddVariantType}>
                  Add
                </Button>
              </Space>
            </Form.Item>
            {variantTypes.map((typeObj, index) => (
              <Form.Item key={typeObj.type} label={`${typeObj.type} Values`}>
                <Space direction="vertical" style={{ width: "100%" }}>
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
                      onImageRemove={handleRemoveImage.bind(null, typeObj.type)}
                      onAddNew={handleAddNewVariantValue}
                    />
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => handleAddNewVariantValue(typeObj.type)}
                    style={{ width: "100%" }}
                  >
                    Add New {typeObj.type} Value
                  </Button>
                </Space>
              </Form.Item>
            ))}
            <Form.Item label="Generate Price Table">
              <Button type="primary" onClick={handleGeneratePriceTable}>
                Generate Price Table
              </Button>
            </Form.Item>
            {generatedVariants.length > 0 && (
              <>
                <Form.Item label="Update Prices and Stock">
                  <Space direction="horizontal" align="center" size="middle">
                    {variantTypes.map((typeObj) => (
                      <Space key={typeObj.type} direction="vertical" size={4}>
                        <label>{`Filter by ${typeObj.type}`}</label>
                        <Select
                          placeholder={`Select ${typeObj.type}`}
                          allowClear
                          style={{ width: 150 }}
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
                      </Space>
                    ))}
                    <Space direction="vertical" size={4}>
                      <label>Price</label>
                      <InputNumber
                        min={0}
                        step={0.01}
                        style={{ width: 100 }}
                        value={updatePrice}
                        onChange={(value) =>
                          setUpdatePrice(value as number | null)
                        }
                      />
                    </Space>
                    <Space direction="vertical" size={4}>
                      <label>Stock Count</label>
                      <InputNumber
                        min={0}
                        style={{ width: 100 }}
                        value={updateStock}
                        onChange={(value) =>
                          setUpdateStock(value as number | null)
                        }
                      />
                    </Space>
                    <Checkbox
                      checked={updateAll}
                      onChange={(e) => setUpdateAll(e.target.checked)}
                      style={{ marginTop: 24 }}
                    >
                      Update All Variants
                    </Checkbox>
                    <Button
                      type="primary"
                      onClick={handleUpdatePrices}
                      style={{ marginTop: 24 }}
                    >
                      Update Selected
                    </Button>
                  </Space>
                </Form.Item>
                <Form.Item label="Variants">
                  <Table
                    columns={variantColumns}
                    dataSource={generatedVariants}
                    pagination={false}
                    rowKey={(record) =>
                      record.properties.map((p) => p.value).join(" ")
                    }
                    size="small"
                  />
                </Form.Item>
              </>
            )}
          </>
        )}
      </Form>
    </Modal>
  );
};

export default ProductFormModal;
