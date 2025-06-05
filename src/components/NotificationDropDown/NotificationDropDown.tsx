import React, { useState, useEffect } from "react";
import { Menu, Badge, Button, Typography, Spin, Empty } from "antd";
import { NotificationOutlined } from "@ant-design/icons";

interface Notification {
  id: number;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data: Notification[] = [
        { id: 1, title: "Đơn hàng mới", content: "Bạn có 1 đơn hàng mới", read: false, createdAt: "2025-05-30" },
        { id: 2, title: "Báo cáo doanh thu", content: "Báo cáo doanh thu tháng 5 đã sẵn sàng", read: true, createdAt: "2025-05-28" },
      ];
      setNotifications(data);
    } catch (error) {
      console.error("Fetch notifications error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  return (
    <Menu style={{ width: 320, maxHeight: 400, overflowY: "auto" }}>
      <Menu.Item
        key="header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <Typography.Title level={5} style={{ margin: 0 }}>
          Thông báo
        </Typography.Title>
        <Button
          size="small"
          onClick={markAllRead}
          disabled={notifications.every((n) => n.read)}
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </Menu.Item>

      {loading ? (
        <Menu.Item key="loading">
          <Spin style={{ display: "block", margin: "24px auto" }} />
        </Menu.Item>
      ) : notifications.length === 0 ? (
        <Menu.Item key="empty">
          <Empty description="Không có thông báo" />
        </Menu.Item>
      ) : (
        notifications.map((item) => (
          <Menu.Item
            key={item.id}
            style={{
              backgroundColor: item.read ? "transparent" : "#e6f7ff",
              padding: "8px 12px",
              cursor: "pointer",
            }}
            onClick={() => markRead(item.id)}
          >
            <div style={{ fontWeight: "bold" }}>{item.title}</div>
            <div style={{ fontSize: 12, color: "#999" }}>{item.content}</div>
            <div style={{ fontSize: 12, color: "#999" }}>{item.createdAt}</div>
          </Menu.Item>
        ))
      )}
    </Menu>
  );
};

export default NotificationDropdown;