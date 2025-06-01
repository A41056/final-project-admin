import React from "react";
import { Row, Col, Input, Select, Switch } from "antd";

const { Option } = Select;

interface FilterPanelProps {
  filters: {
    search: string;
    gender?: string;
    isActive?: boolean;
  };
  onFilterChange: (key: string, value: any) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col span={8}>
        <Input.Search
          placeholder="Search by name, email or phone"
          defaultValue={filters.search}
          onSearch={(value) => onFilterChange("search", value)}
          allowClear
        />
      </Col>

      <Col span={6}>
        <Select
          placeholder="Filter by gender"
          style={{ width: "100%" }}
          value={filters.gender}
          onChange={(value) => onFilterChange("gender", value)}
          allowClear
        >
          <Option value="male">Male</Option>
          <Option value="female">Female</Option>
          <Option value="other">Other</Option>
        </Select>
      </Col>

      <Col span={6}>
        <span>
          Active:{" "}
          <Switch
            checked={filters.isActive}
            onChange={(checked) => onFilterChange("isActive", checked)}
            checkedChildren="Yes"
            unCheckedChildren="No"
          />
        </span>
      </Col>
    </Row>
  );
};

export default FilterPanel;