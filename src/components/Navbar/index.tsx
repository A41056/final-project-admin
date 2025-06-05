import React, { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Badge, Switch, Typography } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { useDarkModeStore } from "@/stores/darkModeStore";
import NotificationDropdown from "../NotificationDropDown/NotificationDropDown";

const { Header } = Layout;
const { Text } = Typography;

const Navbar: React.FC = () => {
  const darkMode = useDarkModeStore((state) => state.darkMode);
  const toggleDarkMode = useDarkModeStore((state) => state.toggleDarkMode);

  const [notiVisible, setNotiVisible] = useState(false);

  const userMenu = (
    <Menu
      theme={darkMode ? "dark" : "light"}
      items={[
        { key: "profile", icon: <UserOutlined />, label: "Profile" },
        { type: "divider" },
        {
          key: "darkmode",
          icon: <BulbOutlined />,
          label: (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Dark Mode</span>
              <Switch checked={darkMode} onChange={toggleDarkMode} size="small" />
            </div>
          ),
          disabled: true,
        },
        { type: "divider" },
        { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
      ]}
    />
  );

  return (
    <Header
      style={{
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: darkMode ? "#001529" : "#fff",
        color: darkMode ? "#fff" : "#000",
      }}
    >
      <Text strong style={{ fontSize: 18, color: "inherit" }}>
        Admin Dashboard
      </Text>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Dropdown
          overlay={<NotificationDropdown onClose={() => setNotiVisible(false)} />} // Sử dụng menu thay cho overlay
          trigger={["click"]}
          open={notiVisible} // Thay vì visible, dùng open
          onOpenChange={(flag) => setNotiVisible(flag)} // Thay onVisibleChange bằng onOpenChange
          placement="bottomRight"
          arrow
        >
          <Badge count={10} offset={[0, 0]}>
            <BellOutlined
              style={{ fontSize: 20, cursor: "pointer", color: "inherit" }}
            />
          </Badge>
        </Dropdown>

        <Dropdown
          overlay={userMenu} // Sử dụng menu thay cho overlay
          trigger={["click"]}
          placement="bottomRight"
        >
          <Avatar icon={<UserOutlined />} style={{ cursor: "pointer", color: "inherit" }} />
        </Dropdown>
      </div>
    </Header>
  );
};

export default Navbar;
