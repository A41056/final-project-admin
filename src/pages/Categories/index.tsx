import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Pagination,
  message,
  Tag,
  Select,
} from "antd";
import { Category } from "@/types/category";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/services/categoryServices";

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    total: 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [tagInput, setTagInput] = useState<string[]>([]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getCategories({
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      });
      setCategories(response.categories);
      setPagination((prev) => ({ ...prev, total: response.categories.length }));
    } catch (error) {
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [pagination.pageNumber, pagination.pageSize]);

  const showModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      form.setFieldsValue(category);
    } else {
      setEditingCategory(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: { name: string; isActive: boolean }) => {
    try {
      if (editingCategory) {
        const updatedCategory = await updateCategory(
          editingCategory.id,
          values
        );
        setCategories(
          categories.map((cat) =>
            cat.id === updatedCategory.id ? updatedCategory : cat
          )
        );
        message.success("Category updated successfully");
      } else {
        const newCategory = await createCategory(values);
        setCategories([...categories, newCategory]);
        message.success("Category created successfully");
      }
      setIsModalVisible(false);
    } catch (error) {
      message.error("Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories(categories.filter((cat) => cat.id !== id));
      message.success("Category deleted successfully");
    } catch (error) {
      message.error("Failed to delete category");
    }
  };

  const handleTagInputChange = async (tags: string[]) => {
    setTagInput(tags);
    try {
      for (const tag of tags) {
        if (!categories.some((cat) => cat.name === tag)) {
          const newCategory = await createCategory({
            name: tag,
            isActive: true,
          });
          setCategories([...categories, newCategory]);
        }
      }
      setTagInput([]);
      message.success("Categories added successfully");
    } catch (error) {
      message.error("Failed to add categories");
    }
  };

  return (
    <div className="w-full p-4">
      {/* Tiêu đề */}
      <h2 className="text-2xl font-bold mt-6 mb-6">
        Welcome to the Categories
      </h2>

      {/* Nút Add Category */}
      <Button type="primary" onClick={() => showModal()} className="mt-4 mb-6">
        Add Category
      </Button>

      {/* Input để nhập multiple tags */}
      <Select
        mode="tags"
        placeholder="Enter category names and press Enter"
        value={tagInput}
        onChange={handleTagInputChange}
        className="w-full mt-4 mb-6"
        tokenSeparators={[","]}
      />

      {/* Hiển thị categories dạng tags */}
      <div className="mt-4 mb-6 flex flex-wrap gap-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          categories.map((category) => (
            <Tag
              key={category.id}
              bordered={false}
              className="flex items-center gap-2 text-base py-1 px-3 rounded-md mt-4"
            >
              {category.name}
              <Button
                type="link"
                size="small"
                onClick={() => showModal(category)}
                className="p-0"
              >
                Edit
              </Button>
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleDelete(category.id)}
                className="p-0"
              >
                Delete
              </Button>
            </Tag>
          ))
        )}
      </div>

      {/* Phân trang - căn giữa */}
      <div className="flex justify-center mt-4 mb-6">
        <Pagination
          current={pagination.pageNumber}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={(page, pageSize) =>
            setPagination({ ...pagination, pageNumber: page, pageSize })
          }
        />
      </div>

      {/* Modal Form CRUD */}
      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Input type="checkbox" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
