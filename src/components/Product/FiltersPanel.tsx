import React from "react";
import { Row, Col, Input, Select, DatePicker, Switch } from "antd";
import { FireOutlined } from "@ant-design/icons";
import { Category } from "@/types/category";
import moment from "moment";

const { Option } = Select;

interface FiltersPanelProps {
  filters: {
    search: string;
    categoryIds: string[];
    isHot?: boolean;
    isActive?: boolean;
    createdFrom?: string;
    createdTo?: string;
  };
  categoriesData?: { categories: Category[] };
  onFilterChange: (key: string, value: any) => void;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  filters,
  categoriesData,
  onFilterChange,
}) => {
    function dayjs(createdFrom: string): import("dayjs").Dayjs | null | undefined {
        throw new Error("Function not implemented.");
    }

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col span={6}>
        <Input.Search
          placeholder="Search products"
          defaultValue={filters.search}
          onSearch={(value) => onFilterChange("search", value)}
          allowClear
        />
      </Col>

      <Col span={6}>
        <Select
          mode="multiple"
          placeholder="Filter by Categories"
          style={{ width: "100%" }}
          value={filters.categoryIds}
          onChange={(value) => onFilterChange("categoryIds", value)}
          allowClear
        >
          {categoriesData?.categories.map((cat) => (
            <Option key={cat.id} value={cat.id}>
              {cat.name}
            </Option>
          ))}
        </Select>
      </Col>

      <Col span={4}>
        <Select
          placeholder={
            <span>
              <FireOutlined /> Filter by Is Hot
            </span>
          }
          style={{ width: "100%" }}
          value={filters.isHot === undefined ? undefined : String(filters.isHot)}
          onChange={(value) =>
            onFilterChange(
              "isHot",
              value === "true" ? true : value === "false" ? false : undefined
            )
          }
          allowClear
        >
          <Option value="true">
            <FireOutlined style={{ color: "#ff4500", marginRight: 8 }} /> Yes
          </Option>
          <Option value="false">
            <FireOutlined style={{ color: "#d3d3d3", marginRight: 8 }} /> No
          </Option>
        </Select>
      </Col>

      <Col span={4}>
        <Select
          placeholder={
            <span>
              <Switch checked disabled /> Filter by Is Active
            </span>
          }
          style={{ width: "100%" }}
          value={filters.isActive === undefined ? undefined : String(filters.isActive)}
          onChange={(value) =>
            onFilterChange(
              "isActive",
              value === "true" ? true : value === "false" ? false : undefined
            )
          }
          allowClear
        >
          <Option value="true">
            <Switch checked disabled style={{ marginRight: 8 }} /> Yes
          </Option>
          <Option value="false">
            <Switch disabled style={{ marginRight: 8 }} /> No
          </Option>
        </Select>
      </Col>

      <Col span={4}>
        <DatePicker.RangePicker
          onChange={(dates) => {
            onFilterChange(
              "createdFrom",
              dates ? dates[0]?.toISOString() : undefined
            );
            onFilterChange(
              "createdTo",
              dates ? dates[1]?.toISOString() : undefined
            );
          }}
          style={{ width: "100%" }}
          value={
            filters.createdFrom && filters.createdTo
              ? [dayjs(filters.createdFrom), dayjs(filters.createdTo)]
              : undefined
          }
          allowClear
        />
      </Col>
    </Row>
  );
};

export default FiltersPanel;