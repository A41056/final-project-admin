import React from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface ProductActionsProps {
  onAddClick: () => void;
}

const ProductActions: React.FC<ProductActionsProps> = ({ onAddClick }) => (
  <div style={{ marginBottom: 16, textAlign: "right" }}>
    <Button type="primary" icon={<PlusOutlined />} onClick={onAddClick}>
      Add Product
    </Button>
  </div>
);

export default ProductActions;