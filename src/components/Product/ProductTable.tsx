import React, { useState } from "react";
import { Table, Button, Switch } from "antd";
import {
  FireOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { Product } from "@/types/product";
import ConfirmModal from "@/components/ConfirmModal"; // Import ConfirmModal

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  onEdit,
  onDelete,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null); // Product to be deleted

  // Show the confirmation modal when delete is clicked
  const showConfirmModal = (product: Product) => {
    setProductToDelete(product);
    setIsModalVisible(true);
  };

  // Handle confirmation (delete product)
  const handleDeleteConfirm = () => {
    if (productToDelete) {
      onDelete(productToDelete.id);
      setIsModalVisible(false);
    }
  };

  // Handle modal cancellation
  const handleCancel = () => {
    setIsModalVisible(false);
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
        <FireOutlined
          style={{ color: isHot ? "#ff4500" : "#d3d3d3", fontSize: 20 }}
        />
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
          style={{ backgroundColor: isActive ? "#52c41a" : "#d9d9d9" }}
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
            onClick={() => onEdit(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => showConfirmModal(record)} // Show confirm modal when delete is clicked
          />
        </>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize,
          total: totalItems,
          onChange: onPageChange,
          position: ["bottomCenter"],
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        visible={isModalVisible}
        text={`Are you sure you want to delete the product "${productToDelete?.name}"?`}
        onConfirm={handleDeleteConfirm} // Delete product on confirm
        onCancel={handleCancel} // Close modal on cancel
      />
    </>
  );
};

export default ProductTable;