import React from "react";
import { Modal, Form, Input, TreeSelect } from "antd";
import { Category } from "@/types/category";

interface Props {
  visible: boolean;
  editingCategory: Category | null;
  treeData: any[];
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const CategoryModal: React.FC<Props> = ({
  visible,
  editingCategory,
  treeData,
  confirmLoading,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (editingCategory) {
      form.setFieldsValue({
        name: editingCategory.name,
        slug: editingCategory.slug,
        parentId: editingCategory.parentId,
        isActive: editingCategory.isActive,
      });
    } else {
      form.resetFields();
    }
  }, [editingCategory, form]);

  return (
    <Modal
      title={editingCategory ? "Edit Category" : "Add Category"}
      visible={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{ isActive: true }}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter category name" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="slug"
          label="Slug"
          rules={[
            { required: false },
            {
              pattern: /^[a-z0-9-]+$/,
              message:
                "Slug can only contain lowercase letters, numbers, and hyphens",
            },
          ]}
        >
          <Input placeholder="Leave blank to auto-generate" />
        </Form.Item>
        <Form.Item name="parentId" label="Parent Category" rules={[{ required: false }]}>
          <TreeSelect
            showSearch
            treeNodeFilterProp="title"
            treeData={treeData}
            placeholder="Select a parent category"
            allowClear
          />
        </Form.Item>
        <Form.Item name="isActive" label="Active" valuePropName="checked">
          <Input type="checkbox" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryModal;