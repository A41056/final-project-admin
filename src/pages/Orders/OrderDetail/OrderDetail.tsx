import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchWithAuth, ORDER_API_URL, orderApi } from "@/config/api";
import { Card, Table, Spin, Typography } from "antd";
import moment from "moment";
import { OrderItem } from "..";

const { Title, Text } = Typography;

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    setLoading(true);
    const response = await fetchWithAuth(`${ORDER_API_URL}/orders/${orderId}`);
    setOrder(response.orders?.[0] ?? null);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (loading) return <Spin size="large" style={{ marginTop: 64 }} />;
  if (!order) return <Text>Order not found.</Text>;

  const totalPrice = order.orderItems?.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Order Detail</Title>
      <Card style={{ marginBottom: 24 }}>
        <p>
          <strong>Order Code:</strong> {order.orderCode}
        </p>
        <p>
          <strong>Order Name:</strong> {order.orderName}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Customer ID:</strong> {order.customerId}
        </p>
        <p>
          <strong>Pay Date:</strong>{" "}
          {moment(order.payDate).format("YYYY-MM-DD HH:mm")}
        </p>
        <p>
          <strong>Total Price:</strong> {totalPrice?.toLocaleString()} đ
        </p>
      </Card>

      <Table
        dataSource={order.orderItems}
        rowKey={(item: OrderItem) => `${item.productId}-${item.price}`}
        pagination={false}
        columns={[
          { title: "Product ID", dataIndex: "productId", key: "productId" },
          { title: "Quantity", dataIndex: "quantity", key: "quantity" },
          { title: "Price", dataIndex: "price", key: "price" },
          {
            title: "Subtotal",
            key: "subtotal",
            render: (_, item) =>
              (item.price * item.quantity).toLocaleString() + " đ",
          },
        ]}
      />
    </div>
  );
};

export default OrderDetail;
