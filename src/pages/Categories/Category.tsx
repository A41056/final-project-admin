import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Pagination,
  Tag,
  theme,
  InputRef,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { TweenOneGroup, IEndCallback } from "rc-tween-one";
import { Category, CreateCategoryResponse } from "@/types/category";
import { catalogApi } from "@/config/api";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/ConfirmModal";
import { useQuery, useMutation, useQueryClient } from "react-query";

interface GetCategoriesResponse {
  categories: Category[];
}

const Categories: React.FC = () => {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<InputRef | null>(null);
  const { token } = theme.useToken();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  // Fetch categories using useQuery
  const { data, isLoading, isError } = catalogApi.useGet("/categories", {
    pageNumber: pagination.pageNumber,
    pageSize: pagination.pageSize,
  }) as { data: GetCategoriesResponse; isLoading: boolean; isError: boolean };

  const categories = data?.categories || []; // Lấy mảng categories từ data

  // Mutations
  const createMutation = catalogApi.usePost();
  const updateMutation = catalogApi.usePut();
  const deleteMutation = catalogApi.useDelete();

  useEffect(() => {
    if (inputVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputVisible]);

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
        await updateMutation.mutateAsync({
          endpoint: `/categories/${editingCategory.id}`,
          data: values,
        });
        toast.success("Category updated successfully");
      } else {
        await createMutation.mutateAsync({
          endpoint: "/categories",
          data: { names: [values.name], isActive: values.isActive },
        });
        toast.success("Category created successfully");
      }
      setIsModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    } catch (error) {
      toast.error("Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(`/categories/${id}`);
      toast.success("Category deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete category: Network error");
    }
  };

  const showConfirmDelete = (id: string) => {
    setConfirmText(
      `Are you sure you want to delete the category "${
        categories.find((cat) => cat.id === id)?.name
      }"? This action cannot be undone.`
    );
    setConfirmAction(() => async () => {
      await handleDelete(id);
      setConfirmVisible(false);
    });
    setConfirmVisible(true);
  };

  const showConfirmCloseInput = () => {
    setConfirmText(
      "You have unsaved changes in the input. Are you sure you want to close without submitting?"
    );
    setConfirmAction(() => () => {
      setInputVisible(false);
      setInputValue("");
      setConfirmVisible(false);
    });
    setConfirmVisible(true);
  };

  const handleCancelConfirm = () => {
    setConfirmVisible(false);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = async () => {
    if (!inputValue.trim()) {
      toast.error("Please enter at least one category name");
      setInputVisible(false);
      setInputValue("");
      return;
    }

    const newCategoryNames = inputValue
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name);
    const uniqueNewNames = [...new Set(newCategoryNames)];

    try {
      const result = (await createMutation.mutateAsync({
        endpoint: "/categories",
        data: { names: uniqueNewNames, isActive: true },
      })) as CreateCategoryResponse;

      const createdCount = result.createdIds?.length || uniqueNewNames.length;
      const duplicateCount = result.duplicates?.length || 0;

      if (createdCount > 0) {
        toast.success(`Added ${createdCount} new categories`);
      }
      if (duplicateCount > 0) {
        toast.warning(
          `Skipped ${duplicateCount} duplicate categories: ${result.duplicates?.join(
            ", "
          )}`
        );
      }
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    } catch (error: any) {
      toast.error("Failed to add categories: Network error");
    }

    setInputVisible(false);
    setInputValue("");
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      showConfirmCloseInput();
    } else {
      setInputVisible(false);
    }
  };

  const forMap = (category: Category) => (
    <span key={category.id} style={{ display: "block", margin: "12px" }}>
      <Tag
        closable
        onClose={(e) => {
          e.preventDefault();
          showConfirmDelete(category.id);
        }}
        style={{
          borderColor: category.isActive ? "#1890ff" : "#d9d9d9",
          backgroundColor: "#f0f0f0",
          color: "#000000",
          borderWidth: 1,
          borderStyle: "solid",
          padding: "4px 8px",
        }}
      >
        {category.name}
        <Button
          type="link"
          size="small"
          onClick={() => showModal(category)}
          style={{ padding: 0, marginLeft: 8 }}
        >
          Edit
        </Button>
      </Tag>
    </span>
  );

  const tagPlusStyle = {
    background: token.colorBgContainer,
    borderStyle: "dashed" as const,
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mt-6 mb-6">
        Welcome to the Categories
      </h2>

      <div
        className="mt-4 mb-6"
        style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
      >
        <TweenOneGroup
          key={categories.length}
          appear={true}
          enter={{ scale: 1.2, opacity: 1, type: "from", duration: 100 }}
          leave={{ opacity: 0, width: 0, scale: 0, duration: 200 }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            width: "100%",
          }}
          onEnd={(e: IEndCallback) => {
            if (e.type === "appear" || e.type === "enter") {
              if (e.target) {
                if (Array.isArray(e.target)) {
                  e.target.forEach((el) => {
                    el.style.display = "block";
                    el.style.transform = "scale(1.2)";
                    el.style.opacity = "1";
                  });
                } else {
                  e.target.style.display = "block";
                  e.target.style.transform = "scale(1.2)";
                  e.target.style.opacity = "1";
                }
              }
            }
          }}
        >
          {isLoading ? (
            <p>Loading...</p>
          ) : isError ? (
            <p>Failed to load categories</p>
          ) : (
            categories.map(forMap)
          )}
        </TweenOneGroup>
      </div>

      {inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          style={{ width: 200 }}
          value={inputValue}
          onChange={handleInputChange}
          onPressEnter={handleInputConfirm}
          onBlur={handleInputBlur}
          placeholder="Enter categories, separated by commas"
        />
      ) : (
        <Tag onClick={showInput} style={tagPlusStyle} className="mt-4 mb-6">
          <PlusOutlined /> New Category
        </Tag>
      )}

      <div className="flex justify-center mt-4 mb-6">
        <Pagination
          current={pagination.pageNumber}
          pageSize={pagination.pageSize}
          total={categories.length} // Cập nhật nếu API trả về total
          onChange={(page, pageSize) =>
            setPagination({ pageNumber: page, pageSize })
          }
        />
      </div>

      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={
          editingCategory ? updateMutation.isLoading : createMutation.isLoading
        }
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

      <ConfirmModal
        visible={confirmVisible}
        text={confirmText}
        onConfirm={confirmAction}
        onCancel={handleCancelConfirm}
      />
    </div>
  );
};

export default Categories;
