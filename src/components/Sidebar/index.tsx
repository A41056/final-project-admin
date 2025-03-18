import React from "react";
import { Layout, Menu } from "antd";
import { Link } from "react-router-dom";
import {
  DashboardOutlined,
  ShoppingOutlined, // Icon cho Products
  ShoppingCartOutlined, // Icon cho Orders
  UserOutlined, // Icon cho Customers
  SettingOutlined,
  TagsOutlined, // Icon cho Categories
} from "@ant-design/icons";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  return (
    <Sider width={250} style={{ background: "#fff" }}>
      <Menu
        mode="inline"
        defaultSelectedKeys={["1"]}
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
