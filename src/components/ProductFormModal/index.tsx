import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Switch,
  Select,
  Upload,
  Button,
  Space,
  Table,
  InputNumber,
  Radio,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Category } from "@/types/category";
import {
  Product,
  CreateProductRequest,
  ProductVariant,
  VariantProperty,
} from "@/types/product";
import { toast } from "react-toastify";
import moment from "moment";

const { Option } = Select;

interface VariantType {
  type: string;
  values: { value: string; image?: string }[];
}

interface ProductFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateProductRequest) => void;
  editingProduct: Product | null;
  categoriesData: { categories: Category[] } | undefined;
  uploadProps: any;
  generateVariants: () => ProductVariant[];
  variantTypes: VariantType[];
  setVariantTypes: React.Dispatch<React.SetStateAction<VariantType[]>>;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  editingProduct,
  categoriesData,
  uploadProps,
  generateVariants,
  variantTypes,
  setVariantTypes,
}) => {
  const [form] = Form.useForm();
  const [variantEnabled, setVariantEnabled] = useState(false);
  const [newVariantTypeName, setNewVariantTypeName] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<string[]>([]);

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
                values: [{ value: prop.value, image: prop.image }],
              });
            } else if (
              !existingType.values.some((v) => v.value === prop.value)
            ) {
              existingType.values.push({
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
      setVariantEnabled(types.length > 0);
    } else {
      form.resetFields();
      setVariantTypes([]);
      setVariantEnabled(false);
    }
  }, [editingProduct, form, setVariantTypes]);

  const handleAddVariantType = () => {
    if (newVariantTypeName.trim()) {
      setVariantTypes((prev) => [
        ...prev,
        { type: newVariantTypeName.trim(), values: [] },
      ]);
      setNewVariantTypeName("");
    }
  };

  const handleAddVariantValue = (type: string, value: string) => {
    setVariantTypes((prev) =>
      prev.map((t) =>
        t.type === type && !t.values.some((v) => v.value === value)
          ? {
              ...t,
              values: [
                ...t.values,
                {
                  value,
                  image: t.type === variantTypes[0]?.type ? "" : undefined,
                },
              ],
            }
          : t
      )
    );
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
    ...(variantTypes.length > 0 && variantTypes[0].type === "Color"
      ? [
          {
            title: "Image",
            dataIndex: "image",
            key: "image",
            render: (_: any, record: ProductVariant) => {
              const firstProp = record.properties.find(
                (p) => p.type === "Color"
              );
              return firstProp ? (
                <Form.Item
                  name={["variantImages", firstProp.value]}
                  valuePropName="fileList"
                  getValueFromEvent={(e) => (Array.isArray(e) ? e : e.fileList)}
                  noStyle
                >
                  <Upload
                    {...uploadProps}
                    listType="picture"
                    maxCount={1}
                    beforeUpload={(file) => {
                      uploadProps.beforeUpload(file);
                      return false;
                    }}
                  >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </Form.Item>
              ) : null;
            },
          },
        ]
      : []),
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
          noStyle
        >
          <InputNumber min={0} />
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
      onOk={() => form.submit()}
      width={1000}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
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
          ]}
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e.fileList)}
        >
          <Upload {...uploadProps} listType="picture">
            <Button icon={<UploadOutlined />}>Upload Images</Button>
          </Upload>
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
                  <Input.Search
                    placeholder={`Enter ${typeObj.type} value (e.g., Red, 64GB)`}
                    enterButton="Add"
                    onSearch={(value) =>
                      handleAddVariantValue(typeObj.type, value)
                    }
                  />
                  <Select
                    mode="multiple"
                    style={{ width: "100%" }}
                    placeholder={`Current ${typeObj.type} values`}
                    value={typeObj.values.map((v) => v.value)}
                    onChange={(values) =>
                      setVariantTypes((prev) =>
                        prev.map((t) =>
                          t.type === typeObj.type
                            ? {
                                ...t,
                                values: values.map((v) => ({
                                  value: v,
                                  image: t.values.find((x) => x.value === v)
                                    ?.image,
                                })),
                              }
                            : t
                        )
                      )
                    }
                  >
                    {typeObj.values.map((v) => (
                      <Option key={v.value} value={v.value}>
                        {v.value}
                      </Option>
                    ))}
                  </Select>
                </Space>
              </Form.Item>
            ))}
            <Form.Item label="Set Prices By">
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Select variant types to group prices"
                onChange={(value) => setPriceFilter(value)}
                value={priceFilter}
              >
                {variantTypes.map((typeObj) => (
                  <Option key={typeObj.type} value={typeObj.type}>
                    {typeObj.type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Variants">
              <Table
                columns={variantColumns}
                dataSource={generateVariants()}
                pagination={false}
                rowKey={(record) =>
                  record.properties.map((p) => p.value).join(" ")
                }
                size="small"
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default ProductFormModal;
