import React from "react";
import { Layout, Typography } from "antd";

const { Footer } = Layout;
const { Text } = Typography;

const DashboardFooter: React.FC = () => {
  return (
    <Footer style={{ textAlign: "center" }}>
      <Text type="secondary">
        Admin Dashboard © {new Date().getFullYear()} Created with Ant Design
      </Text>
    </Footer>
  );
};

export default DashboardFooter;