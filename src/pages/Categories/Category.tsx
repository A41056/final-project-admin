import React, { useState, useEffect } from "react";
import { Input, Tag, Pagination, theme } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Category, CreateCategoryResponse } from "@/types/category";
import { CATALOG_API_URL, catalogApi, fetchWithAuth } from "@/config/api";
import { toast } from "react-toastify";
import { useQueryClient } from "react-query";
import CategoryTagList from "@/components/Category/CategoryTagList";
import CategoryInput from "@/components/Category/CategoryInput";
import CategoryModal from "@/components/Category/CategoryModal";
import ConfirmDeleteModal from "@/components/Category/ConfirmDeleteModal";

interface TreeNode {
  title: string;
  value: string;
  key: string;
  children?: TreeNode[];
  disabled?: boolean;
}

const Categories: React.FC = () => {
  const queryClient = useQueryClient();
  const { token } = theme.useToken();

  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 100 });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputParentId, setInputParentId] = useState<string | undefined>(undefined);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  const { data, isLoading, isError } = catalogApi.useGet("/categories", {
    pageNumber: pagination.pageNumber,
    pageSize: pagination.pageSize,
  }) as { data: { categories: Category[] }; isLoading: boolean; isError: boolean };

  const categories = data?.categories || [];

  const createMutation = catalogApi.usePost();
  const updateMutation = catalogApi.usePut();
  const deleteMutation = catalogApi.useDelete();

  const buildTreeData = (
    categories: Category[],
    editingId?: string
  ): TreeNode[] => {
    const treeData: TreeNode[] = [];
    const categoryMap = new Map<string, TreeNode>();
    const descendants = new Set<string>();

    if (editingId) {
      const findDescendants = (id: string) => {
        categories
          .filter((cat) => cat.parentId === id)
          .forEach((cat) => {
            descendants.add(cat.id);
            findDescendants(cat.id);
          });
      };
      findDescendants(editingId);
    }

    categories.forEach((cat) => {
      categoryMap.set(cat.id, {
        title: cat.name,
        value: cat.id,
        key: cat.id,
        children: [],
        disabled: editingId === cat.id || descendants.has(cat.id),
      });
    });

    categories.forEach((cat) => {
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parentNode = categoryMap.get(cat.parentId)!;
        parentNode.children = parentNode.children || [];
        parentNode.children.push(categoryMap.get(cat.id)!);
      } else {
        treeData.push(categoryMap.get(cat.id)!);
      }
    });

    return treeData;
  };

  const treeData = React.useMemo(
    () => buildTreeData(categories, editingCategory?.id),
    [categories, editingCategory?.id]
  );

  // Category paths state + fetch logic (same as before)
  const [categoryPaths, setCategoryPaths] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const res = await fetchWithAuth(`${CATALOG_API_URL}/categories/tree-with-path`);
        const results: Record<string, string> = {};

        for (const item of res) {
          results[item.category.id] =
            item.path?.map((p: Category) => p.name).join(" > ") || item.category.name;
        }

        setCategoryPaths(results);
      } catch (error) {
        const fallbackResults: Record<string, string> = {};
        for (const cat of categories) {
          fallbackResults[cat.id] = cat.name;
        }
        setCategoryPaths(fallbackResults);
      }
    };

    if (categories.length > 0) fetchPaths();
  }, [categories]);

  // Handlers (show modal, submit form, delete, confirm modals)
  const showModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
    } else {
      setEditingCategory(null);
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          endpoint: `/categories/${editingCategory.id}`,
          data: {
            id: editingCategory.id,
            name: values.name,
            slug: values.slug,
            parentId: values.parentId,
            isActive: values.isActive,
          },
        });
        toast.success("Category updated successfully");
      } else {
        await createMutation.mutateAsync({
          endpoint: "/categories",
          data: {
            names: values.name,
            isActive: values.isActive,
            parentId: values.parentId,
          },
        });
        toast.success("Category created successfully");
      }
      setIsModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    } catch (error: any) {
      toast.error(`Failed to save category: ${error.message || "Network error"}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(`/categories/${id}`);
      toast.success("Category deleted successfully");
    } catch (error: any) {
      toast.error(`Failed to delete category: ${error.message || "Network error"}`);
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
      setInputParentId(undefined);
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
      setInputParentId(undefined);
      return;
    }

    try {
      const result = (await createMutation.mutateAsync({
        endpoint: "/categories",
        data: { names: inputValue, isActive: true, parentId: inputParentId },
      })) as CreateCategoryResponse;

      const createdCount = result.createdIds?.length || 0;
      const duplicateCount = result.duplicates?.length || 0;

      if (createdCount > 0) {
        toast.success(`Added ${createdCount} new categories`);
      }
      if (duplicateCount > 0) {
        toast.warning(
          `Skipped ${duplicateCount} duplicate categories: ${result.duplicates?.join(", ")}`
        );
      }
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    } catch (error: any) {
      toast.error(`Failed to add categories: ${error.message || "Network error"}`);
    }

    setInputVisible(false);
    setInputValue("");
    setInputParentId(undefined);
  };

  const handleInputBlur = () => {
    if (inputValue.trim() || inputParentId) {
      showConfirmCloseInput();
    } else {
      setInputVisible(false);
    }
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mt-6 mb-6">Welcome to the Categories</h2>

      <CategoryTagList
        categories={categories}
        categoryPaths={categoryPaths}
        isLoading={isLoading}
        isError={isError}
        onEdit={showModal}
        onDelete={showConfirmDelete}
      />

      {inputVisible ? (
        <CategoryInput
          inputVisible={inputVisible}
          inputValue={inputValue}
          inputParentId={inputParentId}
          treeData={treeData}
          onChangeValue={handleInputChange}
          onChangeParent={setInputParentId}
          onConfirm={handleInputConfirm}
          onBlur={handleInputBlur}
        />
      ) : (
        <Tag
          onClick={showInput}
          style={{
            background: token.colorBgContainer,
            borderStyle: "dashed",
            cursor: "pointer",
          }}
          className="mt-4 mb-6"
        >
          <PlusOutlined /> New Category
        </Tag>
      )}

      <div className="flex justify-center mt-4 mb-6">
        <Pagination
          current={pagination.pageNumber}
          pageSize={pagination.pageSize}
          total={categories.length}
          onChange={(page, pageSize) => setPagination({ pageNumber: page, pageSize })}
        />
      </div>

      <CategoryModal
        visible={isModalVisible}
        editingCategory={editingCategory}
        treeData={treeData}
        confirmLoading={editingCategory ? updateMutation.isLoading : createMutation.isLoading}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteModal
        visible={confirmVisible}
        text={confirmText}
        onConfirm={confirmAction}
        onCancel={handleCancelConfirm}
      />
    </div>
  );
};

export default Categories;