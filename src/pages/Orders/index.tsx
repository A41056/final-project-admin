import React, { useState } from "react";
import { Table, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { orderApi } from "@/config/api";
import { getOrderStatusLabel } from "@/types/order";

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  variantProperties: {
    type: string;
    value: string;
    image?: string;
  }[];
}

interface Order {
  id: string;
  orderName: string;
  customerId: string;
  status: string;
  orderCode: string;
  payDate: string;
  transactionId: string;
  totalPrice: number;
  shippingAddress: string;
  billingAddress: string;
  orderItems: OrderItem[];
}

interface PaginatedOrders {
  items: Order[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
}

const Orders: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  const {
    data: ordersData,
    isLoading,
    isError,
  } = orderApi.useGet(`/orders?pageNumber=${currentPage}&pageSize=${pageSize}`);

  const columns: ColumnsType<Order> = [
    { title: "Order Code", dataIndex: "orderCode", key: "orderCode" },
    { title: "Order Name", dataIndex: "orderName", key: "orderName" },
    {
      title: "Status",
      key: "status",
      render: (_, record) => getOrderStatusLabel(Number(record.status)),
    },
    {
      title: "Total Price",
      key: "totalPrice",
      render: (_, record: Order) => {
        const total = record.orderItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        return `${total.toLocaleString()} đ`;
      },
    },
    {
      title: "Pay Date",
      dataIndex: "payDate",
      key: "payDate",
      render: (value) => moment(value).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/orders/${record.id}`)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Orders</h2>

      <Table
        columns={columns}
        dataSource={ordersData?.orders.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize,
          total: ordersData?.orders.count || 0,
          onChange: (page) => setCurrentPage(page),
          position: ["bottomCenter"],
        }}
      />
    </div>
  );
};

export default Orders;
