import React, { useState, useEffect } from "react";
import { List, Button, Typography, Spin, Empty } from "antd";

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

  // Giả lập gọi API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Thay bằng fetch thật hoặc axios call API backend
      // Ví dụ:
      // const res = await fetch('/api/notifications');
      // const data = await res.json();

      // Giả lập dữ liệu:
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
    // Gọi API cập nhật trạng thái tất cả đã đọc nếu có
    // Ví dụ: await fetch('/api/notifications/mark-all-read', { method: 'POST' });

    // Cập nhật local
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, read: true }))
    );
  };

  const markRead = (id: number) => {
    // Gọi API cập nhật notification id đã đọc nếu có

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  return (
    <div style={{ width: 320, maxHeight: 400, overflowY: "auto" }}>
      <Typography.Title level={5} style={{ margin: "0 12px" }}>
        Thông báo
        <Button
          size="small"
          style={{ float: "right" }}
          onClick={markAllRead}
          disabled={notifications.every((n) => n.read)}
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </Typography.Title>

      {loading ? (
        <Spin style={{ display: "block", margin: "24px auto" }} />
      ) : notifications.length === 0 ? (
        <Empty description="Không có thông báo" />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              style={{
                backgroundColor: item.read ? "transparent" : "#e6f7ff",
                padding: "8px 12px",
                cursor: "pointer",
                borderBottom: "1px solid #f0f0f0",
              }}
              onClick={() => markRead(item.id)}
            >
              <List.Item.Meta
                title={item.title}
                description={item.content}
              />
              <div style={{ fontSize: 12, color: "#999" }}>{item.createdAt}</div>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default NotificationDropdown;