import React from "react";
import { Layout } from "antd";

const { Footer } = Layout;

const DashboardFooter: React.FC = () => {
  return (
    <Footer
      style={{
        textAlign: "center",
        background: "#fff",
        borderTop: "1px solid #e8e8e8",
      }}
    >
      Admin Dashboard © {new Date().getFullYear()} Created with Ant Design
    </Footer>
  );
};

export default DashboardFooter;
