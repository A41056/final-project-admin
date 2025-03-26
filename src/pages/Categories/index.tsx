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
import {
  createCategoryMutation,
  deleteCategoryMutation,
  getCategoriesQuery,
  updateCategoryMutation,
} from "@/services/categoryServices"; // Sửa import
import { toast } from "react-toastify";
import ConfirmModal from "@/components/ConfirmModal";
import { useQuery, useMutation, useQueryClient } from "react-query";

const Categories: React.FC = () => {
  const queryClient = useQueryClient();
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
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<InputRef | null>(null);
  const { token } = theme.useToken();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getCategoriesQuery({
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      }).queryFn();
      console.log("Fetched categories:", response.categories);
      setCategories(response.categories);
      setPagination((prev) => ({ ...prev, total: response.categories.length }));
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [pagination.pageNumber, pagination.pageSize]);

  useEffect(() => {
    if (inputVisible && inputRef.current) {
      inputRef.current.focus();
      console.log("Input focused");
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
        const updatedCategory = await updateCategoryMutation().mutationFn({
          id: editingCategory.id,
          data: values,
        });
        setCategories(
          categories.map((cat) =>
            cat.id === updatedCategory.id ? updatedCategory : cat
          )
        );
        toast.success("Category updated successfully");
      } else {
        const newCategory = await createCategoryMutation().mutationFn({
          names: [values.name],
          isActive: values.isActive,
        });
        await fetchCategories();
        toast.success("Category created successfully");
      }
      setIsModalVisible(false);
    } catch (error) {
      toast.error("Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategoryMutation().mutationFn(id);
      setCategories(categories.filter((cat) => cat.id !== id));
      toast.success("Category deleted successfully");
    } catch (error: any) {
      if (error.response) {
        const errorMessage =
          error.response.data.message ||
          error.response.data.detail ||
          "An unknown error occurred";
        toast.error(`Failed to delete category: ${errorMessage}`);
      } else {
        toast.error("Failed to delete category: Network error");
      }
    }
  };

  const showConfirmDelete = (id: string) => {
    console.log("Showing confirm delete for ID:", id);
    setConfirmText(
      `Are you sure you want to delete the category "${
        categories.find((cat) => cat.id === id)?.name
      }"? This action cannot be undo.`
    );
    setConfirmAction(() => async () => {
      await handleDelete(id);
      setConfirmVisible(false);
    });
    setConfirmVisible(true);
  };

  const showConfirmCloseInput = () => {
    console.log("Showing confirm close input");
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
    console.log("Cancel confirm");
    setConfirmVisible(false);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Input changed:", e.target.value);
    setInputValue(e.target.value);
  };

  const handleInputConfirm = async () => {
    console.log("Confirm triggered with value:", inputValue);
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
      console.log("Calling createCategory with:", {
        names: uniqueNewNames,
        isActive: true,
      });
      const result: CreateCategoryResponse =
        await createCategoryMutation().mutationFn({
          names: uniqueNewNames,
          isActive: true,
        });

      await fetchCategories();

      const createdCount = result.createdIds.length;
      const duplicateCount = result.duplicates.length;

      if (createdCount > 0) {
        toast.success(
          `Added ${createdCount} new categories: ${uniqueNewNames
            .filter((name) => !result.duplicates.includes(name))
            .join(", ")}`
        );
      }
      if (duplicateCount > 0) {
        toast.warning(
          `Skipped ${duplicateCount} duplicate categories: ${result.duplicates.join(
            ", "
          )}`
        );
      }
    } catch (error: any) {
      if (error.response) {
        const errorMessage =
          error.response.data.message ||
          error.response.data.detail ||
          "An unknown error occurred";
        toast.error(`Failed to add categories: ${errorMessage}`);
      } else {
        toast.error("Failed to add categories: Network error");
      }
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
            console.log("onEnd triggered:", e.type, e.target);
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
          {loading ? <p>Loading...</p> : categories.map(forMap)}
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
          onPressEnter={(e) => {
            console.log("Enter pressed");
            handleInputConfirm();
          }}
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
          total={pagination.total}
          onChange={(page, pageSize) =>
            setPagination({ ...pagination, pageNumber: page, pageSize })
          }
        />
      </div>

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
