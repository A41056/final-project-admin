import React from "react";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom"; // Thêm useLocation
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SettingOutlined,
  TagsOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const location = useLocation();

  const getSelectedKey = () => {
    switch (location.pathname) {
      case "/":
        return "1"; // Dashboard
      case "/products":
        return "2"; // Products
      case "/orders":
        return "3"; // Orders
      case "/customers":
        return "4"; // Customers
      case "/categories":
        return "5"; // Categories
      case "/settings":
        return "6"; // Settings
      default:
        return "1"; // Mặc định là Dashboard nếu không khớp
    }
  };

  return (
    <Sider width={250} style={{ background: "#fff" }}>
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        style={{ height: "100%", borderRight: 0, paddingTop: "16px" }}
      >
        <Menu.Item key="1" icon={<DashboardOutlined />} className="text-lg">
          <Link to="/">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<ShoppingOutlined />} className="text-lg">
          <Link to="/products">Products</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<ShoppingCartOutlined />} className="text-lg">
          <Link to="/orders">Orders</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<UserOutlined />} className="text-lg">
          <Link to="/customers">Customers</Link>
        </Menu.Item>
        <Menu.Item key="5" icon={<TagsOutlined />} className="text-lg">
          <Link to="/categories">Categories</Link>
        </Menu.Item>
        <Menu.Item key="6" icon={<SettingOutlined />} className="text-lg">
          <Link to="/settings">Settings</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
