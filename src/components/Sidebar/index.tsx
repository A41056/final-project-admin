import React from "react";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SettingOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useDarkModeStore } from "@/stores/darkModeStore";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const darkMode = useDarkModeStore((state) => state.darkMode);
  const location = useLocation();

  const getSelectedKey = () => {
    switch (location.pathname) {
      case "/":
        return "1";
      case "/products":
        return "2";
      case "/orders":
        return "3";
      case "/customers":
        return "4";
      case "/categories":
        return "5";
      case "/settings":
        return "6";
      default:
        return "1";
    }
  };

  return (
    <Sider
      width={250}
      collapsible
      style={{ background: darkMode ? "#001529" : "#ffffff" }}
    >
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        style={{ height: "100%", borderRight: 0 }}
        theme={darkMode ? "dark" : "light"}
      >
        <Menu.Item key="1" icon={<DashboardOutlined />}>
          <Link to="/">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<ShoppingOutlined />}>
          <Link to="/products">Products</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<ShoppingCartOutlined />}>
          <Link to="/orders">Orders</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<UserOutlined />}>
          <Link to="/customers">Customers</Link>
        </Menu.Item>
        <Menu.Item key="5" icon={<TagsOutlined />}>
          <Link to="/categories">Categories</Link>
        </Menu.Item>
        <Menu.Item key="6" icon={<SettingOutlined />}>
          <Link to="/settings">Settings</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;